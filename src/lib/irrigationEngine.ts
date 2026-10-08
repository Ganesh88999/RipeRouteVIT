export type IrrigationInput = {
  crop: string
  growthStage: string
  soilMoisture: number
  rainProb: number
  temperature: number
  humidity: number
}

export type IrrigationResult = {
  recommendation: string
  why: string
  waterNeed: string
  waterSavedL: number
  action: "delay" | "irrigate" | "monitor"
}

export function analyzeIrrigation(input: IrrigationInput): IrrigationResult {
  const soil = clamp(input.soilMoisture, 0, 100)
  const rain = clamp(input.rainProb, 0, 100)
  const temp = input.temperature
  const humidity = clamp(input.humidity, 0, 100)

  if (rain >= 60 && soil >= 28) {
    const hours = rain >= 75 ? 8 : 6
    return {
      action: "delay",
      recommendation: `Delay irrigation for ${hours} hours.`,
      why: `Rain probability is ${rain}% and soil moisture is ${soil}%, which is currently adequate for ${input.crop} (${input.growthStage}).`,
      waterNeed: "Low while rainfall is likely",
      waterSavedL: Math.round(90 + hours * 4 + soil * 0.4),
    }
  }

  if (soil < 22 && rain < 35) {
    return {
      action: "irrigate",
      recommendation: "Irrigate in a measured cycle as soon as practical.",
      why: `Soil moisture is ${soil}% with only ${rain}% rain probability (${temp}°C, ${humidity}% humidity).`,
      waterNeed: "High",
      waterSavedL: 0,
    }
  }

  if (soil < 32 && temp >= 32 && rain < 50) {
    return {
      action: "irrigate",
      recommendation: "Plan a light irrigation and recheck moisture after 4 hours.",
      why: `Warm conditions (${temp}°C) with soil moisture at ${soil}% and ${rain}% rain probability.`,
      waterNeed: "Moderate",
      waterSavedL: 35,
    }
  }

  return {
    action: "monitor",
    recommendation: "Hold a full irrigation cycle and monitor crop stress.",
    why: `Soil moisture ${soil}%, rain probability ${rain}%, humidity ${humidity}% — no urgent irrigation change for ${input.crop}.`,
    waterNeed: "Moderate",
    waterSavedL: 48,
  }
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}
