import type { IncomingMessage, ServerResponse } from "node:http"
import type { Plugin } from "vite"
import {
  buildFarmerSupportPrompt,
  geminiUnavailableMessage,
  isOffTopicFarmerQuestion,
  offTopicRedirect,
  resolveLang,
  sanitizeFarmerSupportAnswer,
  validateFarmerSupportQuestion,
} from "./farmerSupportGuardrails.ts"
import { calculateIrrigation, soilFractionToPct } from "./irrigationCalc.ts"
import { fetchWeather, geocodePlace, reverseGeocode } from "./openMeteo.ts"

const MAX_BODY = 7_500_000

type GeminiJson = Record<string, unknown>

const LANG_NAMES: Record<string, string> = {
  en: "English",
  ta: "Tamil",
  hi: "Hindi",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati",
  pa: "Punjabi",
  as: "Assamese",
  or: "Odia",
}

function languageInstruction(body: GeminiJson): string {
  const raw = body.language
  const code = (typeof raw === "string" && raw.trim() ? raw : "en").toLowerCase()
  const name = LANG_NAMES[code] || "English"
  return [
    `User language: ${name} (${code}).`,
    `Respond entirely in ${name}.`,
    "Do not mix languages unless the user explicitly asks for translation.",
    "Keep technical values, numbers, crop names, units, and required official names accurate.",
    "All user-facing explanatory text fields in the JSON must be written in the requested language.",
  ].join(" ")
}

export function riperouteApiPlugin(geminiKey: string): Plugin {
  const handle = (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const raw = req.url ?? ""
    const path = raw.split("?")[0] ?? ""
    if (!path.startsWith("/api/")) {
      next()
      return
    }
    void route(raw, req, res, geminiKey).catch((error: unknown) => {
      sendJson(res, 500, {
        ok: false,
        code: "server_error",
        message: "Unable to complete the request.",
        detail: error instanceof Error ? error.message : "unknown",
      })
    })
  }

  return {
    name: "riperoute-api",
    configureServer(server) {
      server.middlewares.use(handle)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handle)
    },
  }
}

async function route(raw: string, req: IncomingMessage, res: ServerResponse, key: string) {
  const [path, queryString] = raw.split("?")
  const params = new URLSearchParams(queryString || "")

  if (req.method === "GET" && path === "/api/weather") {
    await weatherGet(res, params)
    return
  }
  if (req.method === "GET" && path === "/api/geocode") {
    await geocodeGet(res, params)
    return
  }
  if (req.method === "GET" && path === "/api/reverse-geocode") {
    await reverseGeocodeGet(res, params)
    return
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, code: "method", message: "Method not allowed." })
    return
  }

  let body: GeminiJson
  try {
    body = await readJson(req)
  } catch {
    sendJson(res, 400, { ok: false, code: "invalid_image", message: "Request body could not be read." })
    return
  }

  if (path === "/api/analyze-crop") {
    await analyzeCrop(res, key, body)
    return
  }
  if (path === "/api/analyze-farm") {
    await analyzeFarm(res, key, body)
    return
  }
  if (path === "/api/explain-scheme") {
    await explainScheme(res, key, body)
    return
  }
  if (path === "/api/irrigation-analysis") {
    await irrigationAnalysis(res, key, body)
    return
  }
  if (path === "/api/farmer-support") {
    await farmerSupport(res, key, body)
    return
  }

  sendJson(res, 404, { ok: false, code: "not_found", message: "Unknown API route." })
}

async function reverseGeocodeGet(res: ServerResponse, params: URLSearchParams) {
  const lat = Number(params.get("lat"))
  const lon = Number(params.get("lon"))
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    sendJson(res, 400, { ok: false, code: "validation", message: "Latitude and longitude are required." })
    return
  }
  try {
    const place = await reverseGeocode(lat, lon)
    sendJson(res, 200, { ok: true, place })
  } catch {
    sendJson(res, 502, { ok: false, code: "weather_failed", message: "Location lookup failed." })
  }
}

async function weatherGet(res: ServerResponse, params: URLSearchParams) {
  const lat = Number(params.get("lat"))
  const lon = Number(params.get("lon"))
  const accuracy = params.get("accuracy")
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    sendJson(res, 400, { ok: false, code: "validation", message: "Latitude and longitude are required." })
    return
  }
  try {
    const weather = await fetchWeather(lat, lon, accuracy ? Number(accuracy) : null)
    sendJson(res, 200, { ok: true, weather })
  } catch {
    sendJson(res, 502, { ok: false, code: "weather_failed", message: "Live weather data could not be loaded." })
  }
}

async function geocodeGet(res: ServerResponse, params: URLSearchParams) {
  const q = (params.get("q") || "").trim()
  if (q.length < 2) {
    sendJson(res, 400, { ok: false, code: "validation", message: "Enter a city or place name." })
    return
  }
  try {
    const place = await geocodePlace(q)
    if (!place) {
      sendJson(res, 404, { ok: false, code: "not_found", message: "That location could not be found." })
      return
    }
    sendJson(res, 200, { ok: true, place })
  } catch {
    sendJson(res, 502, { ok: false, code: "weather_failed", message: "Location lookup failed." })
  }
}

async function irrigationAnalysis(res: ServerResponse, key: string, body: GeminiJson) {
  const crop = asString(body.crop) || "Tomato"
  const growthStage = asString(body.growthStage) || "Unspecified"
  const weather = (body.weather && typeof body.weather === "object" ? body.weather : {}) as GeminiJson
  const soil = (body.soil && typeof body.soil === "object" ? body.soil : {}) as GeminiJson

  const soilFrac = optionalNum(soil.moisture9to27cm) ?? optionalNum(soil.moisture0to1cm)
  const calc = calculateIrrigation({
    crop,
    growthStage,
    temperatureC: optionalNum(weather.temperatureC),
    humidity: optionalNum(weather.humidity),
    rainProbabilityPercent: optionalNum(weather.rainProbabilityPercent),
    rainMm: optionalNum(weather.rainMm),
    soilMoisturePct: soilFractionToPct(soilFrac),
    soilTemperatureC: optionalNum(soil.temperature6cm),
  })

  let explanation: string | null = null
  if (key) {
    try {
      const result = await geminiJson(
        key,
        [
          languageInstruction(body),
          "Explain this irrigation recommendation in simple language for a farmer.",
          "Use ONLY these facts. Do not invent sensor readings or exact field measurements.",
          `Decision: ${calc.decision}`,
          `Recommendation: ${calc.recommendation}`,
          ...calc.reason.map((item) => `- ${item}`),
          "Soil moisture, if present, is a weather-model estimate, not an on-farm sensor.",
          "Return JSON: { explanation: string }",
        ].join("\n"),
      )
      explanation = asString(result.explanation) || null
    } catch {
      explanation = null
    }
  }

  sendJson(res, 200, {
    ok: true,
    result: {
      ...calc,
      soilMoisturePercent: soilFractionToPct(soilFrac),
      soilSource: "modelled",
      explanation,
    },
  })
}

function optionalNum(value: unknown) {
  if (value == null || value === "") return null
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

async function analyzeCrop(res: ServerResponse, key: string, body: GeminiJson) {
  if (!key) {
    sendJson(res, 503, {
      ok: false,
      code: "not_connected",
      message: "Image analysis is not connected yet.",
    })
    return
  }

  const image = asString(body.image)
  const mimeType = asString(body.mimeType) || "image/jpeg"
  const crop = asString(body.crop)
  const location = asString(body.location)
  const growthStage = asString(body.growthStage)

  const parsed = parseDataUrl(image)
  if (!parsed) {
    sendJson(res, 400, { ok: false, code: "invalid_image", message: "A valid image is required." })
    return
  }
  if (!isAllowedMime(parsed.mime || mimeType)) {
    sendJson(res, 400, { ok: false, code: "invalid_type", message: "Use a JPEG, PNG, or WebP image." })
    return
  }

  const prompt = [
    languageInstruction(body),
    "You are an agricultural vision assistant for RipeRoute.",
    "Analyze ONLY visible evidence in this photograph.",
    "Never claim a definite disease diagnosis.",
    "Never infer soil chemistry, pH, or nutrients from the image.",
    "If the photo is not a plant or crop, say so.",
    "Use cautious wording such as possible issue detected, AI-assisted assessment, consider confirmation by an agricultural expert.",
    crop ? `Farmer-stated crop context (may be wrong): ${crop}` : "",
    location ? `Farm location context: ${location}` : "",
    growthStage ? `Stated growth stage: ${growthStage}` : "",
    "Return JSON only with keys:",
    "likelyCrop (string), confidence (0-100 number), imageIsCrop (boolean),",
    "overallCondition (string), visibleStress (string), possibleIssues (string[]),",
    "recommendations (string[]), needsExpertReview (boolean), notes (string).",
  ]
    .filter(Boolean)
    .join("\n")

  try {
    const result = await geminiJson(key, prompt, parsed)
    sendJson(res, 200, { ok: true, source: "gemini", result: normalizeCropResult(result) })
  } catch {
    sendJson(res, 502, {
      ok: false,
      code: "ai_failed",
      message: "AI analysis could not be completed.",
    })
  }
}

async function analyzeFarm(res: ServerResponse, key: string, body: GeminiJson) {
  const location = asString(body.location)
  const area = asString(body.area)
  const growthStage = asString(body.growthStage)
  const crop = asString(body.crop)
  const soilMoisture = optionalNum(body.soilMoisture) ?? Number.NaN
  const rainProb = optionalNum(body.rainProb) ?? Number.NaN
  const temperature = optionalNum(body.temperature) ?? Number.NaN
  const imageNotes = asString(body.imageNotes)

  if (!location || !area || !growthStage || !crop) {
    sendJson(res, 400, {
      ok: false,
      code: "validation",
      message: "Location, farm area, growth stage, and crop are required.",
    })
    return
  }

  const local = localFarmAssessment({
    location,
    area,
    growthStage,
    crop,
    soilMoisture,
    rainProb,
    temperature,
    imageNotes,
  })

  if (!key) {
    sendJson(res, 200, { ok: true, source: "local", result: local })
    return
  }

  const prompt = [
    languageInstruction(body),
    "You are a farm operations assistant. Use only the farmer-provided facts.",
    "Do not invent lab soil chemistry. State that accurate soil chemistry requires a soil test.",
    "Return JSON with keys: cropCondition, weatherRisk, irrigationRecommendation, potentialStress, nextAction, summary.",
    `Crop: ${crop}`,
    `Location: ${location}`,
    `Area: ${area}`,
    `Growth stage: ${growthStage}`,
    `Soil moisture % (simulated/user): ${Number.isFinite(soilMoisture) ? soilMoisture : "unknown"}`,
    `Rain probability % (simulated/user): ${Number.isFinite(rainProb) ? rainProb : "unknown"}`,
    `Temperature C (simulated/user): ${Number.isFinite(temperature) ? temperature : "unknown"}`,
    imageNotes ? `Image assessment notes: ${imageNotes}` : "No image assessment notes.",
  ].join("\n")

  try {
    const result = await geminiJson(key, prompt)
    sendJson(res, 200, {
      ok: true,
      source: "gemini",
      result: {
        ...local,
        ...pickStrings(result, [
          "cropCondition",
          "weatherRisk",
          "irrigationRecommendation",
          "potentialStress",
          "nextAction",
          "summary",
        ]),
      },
    })
  } catch {
    sendJson(res, 200, { ok: true, source: "local", result: local, warning: "ai_failed" })
  }
}

async function farmerSupport(res: ServerResponse, key: string, body: GeminiJson) {
  const lang = resolveLang(body.language)
  const validated = validateFarmerSupportQuestion(body.question ?? body.message, lang.code)
  if (!validated.ok) {
    sendJson(res, 200, {
      ok: true,
      source: "guardrail",
      answer: validated.message,
      caution: "AI guidance is informational.",
      dataType: "unavailable",
    })
    return
  }
  const question = validated.question

  if (isOffTopicFarmerQuestion(question)) {
    sendJson(res, 200, {
      ok: true,
      source: "guardrail",
      answer: offTopicRedirect(lang.code),
      caution: "AI guidance is informational.",
      dataType: "unavailable",
    })
    return
  }

  const crop = asString(body.crop)
  const location = asString(body.location)
  const state = asString(body.state)
  const growthStage = asString(body.growthStage)
  const waterAvailability = asString(body.waterAvailability) || asString(body.irrigation)
  const farmSizeRaw = body.farmSizeAcres ?? body.farmSize
  const farmSizeAcres =
    typeof farmSizeRaw === "number"
      ? farmSizeRaw
      : typeof farmSizeRaw === "string" && farmSizeRaw.trim()
        ? Number(farmSizeRaw)
        : null

  const local = geminiUnavailableMessage(lang.code)

  if (!key) {
    sendJson(res, 200, {
      ok: true,
      source: "local",
      answer: local,
      caution: "AI guidance is informational.",
      dataType: "unavailable",
    })
    return
  }

  const prompt = buildFarmerSupportPrompt(lang, question, {
    crop: crop || undefined,
    location: location || undefined,
    state: state || undefined,
    farmSizeAcres: farmSizeAcres != null && Number.isFinite(farmSizeAcres) ? farmSizeAcres : null,
    growthStage: growthStage || undefined,
    waterAvailability: waterAvailability || undefined,
  })

  try {
    const result = await geminiJson(key, prompt)
    const rawAnswer =
      asString(result.answer) ||
      "I could not form a reliable answer. Try Farm & Crop Advisor or a local extension officer."
    const answer = sanitizeFarmerSupportAnswer(rawAnswer, lang.code, {
      hasVerifiedMarketData: false,
      hasVerifiedWeather: false,
    })
    sendJson(res, 200, {
      ok: true,
      source: "gemini",
      answer,
      caution:
        asString(result.caution) ||
        "AI guidance is informational. Verify critical crop, chemical, financial, or government decisions with an appropriate official or agricultural professional.",
      dataType: asString(result.dataType) || "estimated",
    })
  } catch {
    sendJson(res, 200, {
      ok: true,
      source: "local",
      answer: local,
      caution: "AI guidance is informational.",
      warning: "ai_failed",
      dataType: "unavailable",
    })
  }
}

async function explainScheme(res: ServerResponse, key: string, body: GeminiJson) {
  const schemeName = asString(body.schemeName)
  const facts = Array.isArray(body.facts) ? body.facts.map(String) : []
  const eligibility = asString(body.eligibility)
  const why = asString(body.why)

  if (!schemeName || facts.length === 0) {
    sendJson(res, 400, { ok: false, code: "validation", message: "Scheme facts are required." })
    return
  }

  if (!key) {
    sendJson(res, 200, {
      ok: true,
      source: "none",
      explanation: `${eligibility} ${why}`.trim(),
    })
    return
  }

  const prompt = [
    languageInstruction(body),
    "Explain this government scheme result in simple language for a farmer.",
    "Use ONLY the facts provided. Do not invent eligibility, amounts, documents, or URLs.",
    "Do not invent government scheme information. Translate and explain the verified facts only.",
    "If something is missing, say it must be verified on the official source.",
    `Scheme: ${schemeName}`,
    `Preliminary eligibility: ${eligibility}`,
    `Rule result: ${why}`,
    "Verified facts:",
    ...facts.map((fact) => `- ${fact}`),
    "Return JSON: { explanation: string }",
  ].join("\n")

  try {
    const result = await geminiJson(key, prompt)
    sendJson(res, 200, {
      ok: true,
      source: "gemini",
      explanation: asString(result.explanation) || why,
    })
  } catch {
    sendJson(res, 502, {
      ok: false,
      code: "ai_failed",
      message: "AI analysis could not be completed.",
    })
  }
}

function localFarmAssessment(input: {
  location: string
  area: string
  growthStage: string
  crop: string
  soilMoisture: number
  rainProb: number
  temperature: number
  imageNotes: string
}) {
  const rainKnown = Number.isFinite(input.rainProb)
  const soilKnown = Number.isFinite(input.soilMoisture)
  const tempKnown = Number.isFinite(input.temperature)
  const rain = rainKnown ? input.rainProb : null
  const soil = soilKnown ? input.soilMoisture : null
  const temp = tempKnown ? input.temperature : null
  const delay = rain != null && soil != null && rain >= 55 && soil >= 28
  const irrigate = rain != null && soil != null && soil < 24 && rain < 40

  return {
    cropCondition: `${input.crop} at ${input.growthStage} on ${input.area} in ${input.location}.`,
    weatherRisk:
      rain != null
        ? rain >= 55
          ? `Elevated rain probability (${rain}%).`
          : `Rain probability ${rain}%.`
        : "Live rain probability was not provided.",
    irrigationRecommendation: delay
      ? `Delay irrigation and monitor crop stress (${rain}% rain probability, ${soil}% soil moisture).`
      : irrigate
        ? `Irrigation may be needed soon (${soil}% soil moisture, ${rain}% rain probability).`
        : soil != null
          ? `Monitor moisture; no urgent irrigation change at ${soil}% soil moisture.`
          : "Open Irrigation & Weather to load live conditions before irrigating.",
    potentialStress:
      temp != null && temp >= 33
        ? `Heat stress possible at ${temp}°C.`
        : input.imageNotes || "Stress should be confirmed visually and with an expert if symptoms appear.",
    nextAction: delay
      ? "Hold irrigation, then reassess after rainfall."
      : irrigate
        ? "Plan a measured irrigation and recheck soil moisture."
        : "Continue monitoring weather and crop appearance.",
    summary: "Accurate soil chemistry requires a soil test. This assessment uses the information you entered plus live weather when available.",
    soilDisclaimer: "Accurate soil chemistry requires a soil test.",
  }
}

function normalizeCropResult(raw: GeminiJson) {
  const issues = Array.isArray(raw.possibleIssues) ? raw.possibleIssues.map(String) : []
  const recs = Array.isArray(raw.recommendations) ? raw.recommendations.map(String) : []
  const confidence = clampNumber(raw.confidence, 0, 100)
  return {
    likelyCrop: asString(raw.likelyCrop) || "Not identified",
    confidence,
    imageIsCrop: Boolean(raw.imageIsCrop),
    overallCondition: asString(raw.overallCondition) || "AI-assisted assessment only.",
    visibleStress: asString(raw.visibleStress) || "Not determined from this image.",
    possibleIssues: issues,
    recommendations: recs,
    needsExpertReview: raw.needsExpertReview !== false,
    notes: asString(raw.notes),
  }
}

async function geminiJson(key: string, prompt: string, image?: { mime: string; data: string }) {
  const models = ["gemini-3.6-flash", "gemini-3-flash", "gemini-2.0-flash"]
  let last = "Gemini request failed."

  for (const model of models) {
    const parts: unknown[] = [{ text: prompt }]
    if (image) {
      parts.push({ inline_data: { mime_type: image.mime, data: image.data } })
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
        }),
      },
    )

    if (!response.ok) {
      last = `Gemini ${response.status}`
      continue
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("\n") ?? ""
    return parseModelJson(text)
  }

  throw new Error(last)
}

function parseModelJson(text: string): GeminiJson {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim()
  const parsed: unknown = JSON.parse(trimmed)
  if (!parsed || typeof parsed !== "object") throw new Error("invalid_json")
  return parsed as GeminiJson
}

function parseDataUrl(value: string) {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([A-Za-z0-9+/=\s]+)$/.exec(value)
  if (match) {
    return { mime: match[1], data: match[2].replace(/\s/g, "") }
  }
  if (/^[A-Za-z0-9+/=\s]+$/.test(value) && value.length > 80) {
    return { mime: "image/jpeg", data: value.replace(/\s/g, "") }
  }
  return null
}

function isAllowedMime(mime: string) {
  return ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(mime)
}

async function readJson(req: IncomingMessage): Promise<GeminiJson> {
  const raw = await readBody(req)
  if (!raw) return {}
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== "object") return {}
  return parsed as GeminiJson
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on("data", (chunk: string | Buffer) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buf.length
      if (size > MAX_BODY) {
        reject(new Error("too_large"))
        req.destroy()
        return
      }
      chunks.push(buf)
    })
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("error", reject)
  })
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify(payload))
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function clampNumber(value: unknown, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.min(max, Math.max(min, Math.round(n)))
}

function pickStrings(source: GeminiJson, keys: string[]) {
  const out: Record<string, string> = {}
  for (const key of keys) {
    const value = asString(source[key])
    if (value) out[key] = value
  }
  return out
}
