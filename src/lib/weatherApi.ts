import { AiApiError, type ApiErrorCode } from "./aiApi"

export type WeatherPayload = {
  location: {
    latitude: number
    longitude: number
    name: string | null
    accuracyM: number | null
  }
  current: {
    temperatureC: number | null
    humidity: number | null
    rainMm: number | null
    weatherCode: number | null
  }
  forecast: {
    rainProbabilityPercent: number | null
  }
  soil: {
    moisture0to1cm: number | null
    moisture9to27cm: number | null
    temperature6cm: number | null
    moistureKind: "modelled"
  }
  observedAt: string | null
  source: string
}

export type IrrigationAnalysisResult = {
  decision: "DELAY" | "IRRIGATE" | "REVIEW"
  hoursUntilReview: number
  reason: string[]
  estimatedWaterNeedLiters: number | null
  confidence: number
  recommendation: string
  soilMoisturePercent: number | null
  soilSource: string
  explanation: string | null
}

async function getJson<T>(path: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(path)
  } catch {
    throw new AiApiError("Unable to connect.", "network")
  }
  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    code?: ApiErrorCode
    message?: string
  } & T
  if (!response.ok || data.ok === false) {
    throw new AiApiError(data.message || "Live weather data could not be loaded.", data.code || "network")
  }
  return data
}

export async function fetchLiveWeather(lat: number, lon: number, accuracy?: number) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  })
  if (accuracy != null) params.set("accuracy", String(Math.round(accuracy)))
  const data = await getJson<{ weather: WeatherPayload }>(`/api/weather?${params}`)
  return data.weather
}

export async function geocodeLocation(query: string) {
  const data = await getJson<{
    place: {
      latitude: number
      longitude: number
      name: string
      city?: string | null
      state?: string | null
      country?: string | null
    }
  }>(`/api/geocode?q=${encodeURIComponent(query)}`)
  return data.place
}

export async function reverseGeocodeLocation(lat: number, lon: number) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
  })
  const data = await getJson<{
    place: {
      latitude: number
      longitude: number
      locationName: string
      city: string | null
      state: string | null
      country: string | null
    }
  }>(`/api/reverse-geocode?${params}`)
  return data.place
}

export async function runIrrigationAnalysis(input: {
  crop: string
  growthStage: string
  location: { latitude: number; longitude: number }
  weather: {
    temperatureC: number | null
    humidity: number | null
    rainProbabilityPercent: number | null
    rainMm: number | null
  }
  soil: WeatherPayload["soil"]
}) {
  let response: Response
  try {
    response = await fetch("/api/irrigation-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...input,
        language: (() => {
          try {
            return localStorage.getItem("riperoute.lang") || "en"
          } catch {
            return "en"
          }
        })(),
      }),
    })
  } catch {
    throw new AiApiError("Unable to connect.", "network")
  }
  const data = (await response.json().catch(() => ({}))) as {
    ok?: boolean
    message?: string
    result?: IrrigationAnalysisResult
  }
  if (!response.ok || !data.result) {
    throw new AiApiError(data.message || "Irrigation analysis could not be completed.", "ai_failed")
  }
  return data.result
}
