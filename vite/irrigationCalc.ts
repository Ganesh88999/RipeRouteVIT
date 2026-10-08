export type IrrigationDecision = "DELAY" | "IRRIGATE" | "REVIEW"

export type IrrigationCalc = {
  decision: IrrigationDecision
  hoursUntilReview: number
  reason: string[]
  estimatedWaterNeedLiters: number | null
  confidence: number
  recommendation: string
}

const ADEQUATE_SOIL_PCT = 28
const LOW_SOIL_PCT = 22
const HIGH_RAIN_PCT = 60
const LOW_RAIN_PCT = 35
const HOT_C = 32

export function calculateIrrigation(input: {
  crop: string
  growthStage: string
  temperatureC: number | null
  humidity: number | null
  rainProbabilityPercent: number | null
  rainMm: number | null
  soilMoisturePct: number | null
  soilTemperatureC: number | null
}): IrrigationCalc {
  const soil = input.soilMoisturePct
  const rain = input.rainProbabilityPercent
  const temp = input.temperatureC
  const recent = input.rainMm
  const reasons: string[] = []

  if (soil != null) reasons.push(`Estimated soil moisture is ${round(soil)}%.`)
  else reasons.push("Estimated soil moisture is not available.")
  if (rain != null) reasons.push(`Rain probability (next hours) is ${round(rain)}%.`)
  else reasons.push("Rain probability is not available.")
  if (recent != null) reasons.push(`Current/recent precipitation is ${round(recent)} mm.`)
  if (temp != null) reasons.push(`Air temperature is ${round(temp)}°C.`)
  reasons.push(`Crop: ${input.crop}. Growth stage: ${input.growthStage}.`)

  const soilOk = soil != null && soil >= ADEQUATE_SOIL_PCT
  const soilLow = soil != null && soil < LOW_SOIL_PCT
  const rainHigh = rain != null && rain >= HIGH_RAIN_PCT
  const rainLow = rain != null && rain < LOW_RAIN_PCT
  const wetNow = recent != null && recent >= 1
  const hot = temp != null && temp >= HOT_C

  if (soil == null && rain == null) {
    return {
      decision: "REVIEW",
      hoursUntilReview: 4,
      reason: reasons,
      estimatedWaterNeedLiters: null,
      confidence: 30,
      recommendation: "REVIEW CONDITIONS",
    }
  }

  if ((soilOk && rainHigh) || wetNow) {
    const hours = rain != null && rain >= 75 ? 8 : 6
    return {
      decision: "DELAY",
      hoursUntilReview: hours,
      reason: reasons,
      estimatedWaterNeedLiters: 0,
      confidence: soil != null && rain != null ? 82 : 60,
      recommendation: "DELAY IRRIGATION",
    }
  }

  if (soilLow && rainLow) {
    return {
      decision: "IRRIGATE",
      hoursUntilReview: 4,
      reason: reasons,
      estimatedWaterNeedLiters: estimateLiters(soil, hot),
      confidence: 78,
      recommendation: "IRRIGATE NOW",
    }
  }

  if (soil != null && soil < 32 && hot && (rain == null || rain < 50)) {
    return {
      decision: "IRRIGATE",
      hoursUntilReview: 4,
      reason: reasons,
      estimatedWaterNeedLiters: estimateLiters(soil, true),
      confidence: 70,
      recommendation: "IRRIGATE NOW",
    }
  }

  return {
    decision: "REVIEW",
    hoursUntilReview: 6,
    reason: reasons,
    estimatedWaterNeedLiters: soil != null && soil < ADEQUATE_SOIL_PCT ? 80 : 40,
    confidence: 58,
    recommendation: "REVIEW CONDITIONS",
  }
}

function estimateLiters(soil: number | null, hot: boolean) {
  if (soil == null) return null
  const deficit = Math.max(0, ADEQUATE_SOIL_PCT - soil)
  return Math.round(60 + deficit * 8 + (hot ? 25 : 0))
}

function round(value: number) {
  return Math.round(value * 10) / 10
}

export function soilFractionToPct(value: number | null) {
  if (value == null) return null
  if (value <= 1) return Math.round(value * 1000) / 10
  return Math.round(value * 10) / 10
}
