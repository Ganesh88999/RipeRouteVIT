export type ApiErrorCode =
  | "not_connected"
  | "ai_failed"
  | "invalid_image"
  | "invalid_type"
  | "validation"
  | "network"
  | "too_large"

export class AiApiError extends Error {
  code: ApiErrorCode
  constructor(message: string, code: ApiErrorCode) {
    super(message)
    this.code = code
  }
}

function currentUiLanguage(): string {
  try {
    return localStorage.getItem("riperoute.lang") || "en"
  } catch {
    return "en"
  }
}

export type CropAnalysis = {
  likelyCrop: string
  confidence: number
  imageIsCrop: boolean
  overallCondition: string
  visibleStress: string
  possibleIssues: string[]
  recommendations: string[]
  needsExpertReview: boolean
  notes: string
}

export type FarmAnalysis = {
  cropCondition: string
  weatherRisk: string
  irrigationRecommendation: string
  potentialStress: string
  nextAction: string
  summary: string
  soilDisclaimer?: string
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const body =
    payload && typeof payload === "object"
      ? { ...(payload as Record<string, unknown>), language: currentUiLanguage() }
      : payload

  let response: Response
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AiApiError("Unable to connect.", "network")
  }

  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    code?: ApiErrorCode
    message?: string
    result?: T
    explanation?: string
    source?: string
    warning?: string
  }

  if (!response.ok || data.ok === false) {
    throw new AiApiError(
      data.message || "AI analysis could not be completed.",
      data.code || (response.status === 503 ? "not_connected" : "ai_failed"),
    )
  }

  return data as T
}

export async function analyzeCropImage(input: {
  image: string
  mimeType: string
  crop?: string
  location?: string
  growthStage?: string
}) {
  const data = await postJson<{ result: CropAnalysis }>("/api/analyze-crop", input)
  return data.result
}

export async function analyzeFarmProfile(input: {
  crop: string
  location: string
  area: string
  growthStage: string
  soilMoisture?: number
  rainProb?: number
  temperature?: number
  imageNotes?: string
}) {
  const data = await postJson<{ result: FarmAnalysis; source?: string }>("/api/analyze-farm", input)
  return data
}

export async function explainSchemeResult(input: {
  schemeName: string
  facts: string[]
  eligibility: string
  why: string
}) {
  const data = await postJson<{ explanation: string }>("/api/explain-scheme", input)
  return data.explanation
}

export async function askFarmerSupport(input: {
  question: string
  crop?: string
  location?: string
  state?: string
  farmSizeAcres?: number | null
  growthStage?: string
  waterAvailability?: string
}) {
  const data = await postJson<{
    answer: string
    caution?: string
    source?: string
    dataType?: string
  }>("/api/farmer-support", input)
  return data
}
