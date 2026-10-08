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

function num(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

export async function fetchWeather(lat: number, lon: number, accuracyM: number | null): Promise<WeatherPayload> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(String(lat))}` +
    `&longitude=${encodeURIComponent(String(lon))}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code` +
    `&hourly=precipitation_probability,precipitation,soil_moisture_0_to_1cm,soil_moisture_9_to_27cm,soil_temperature_6cm` +
    `&forecast_days=2&timezone=auto`

  const response = await fetch(url)
  if (!response.ok) throw new Error("weather_unavailable")
  const data = (await response.json()) as {
    current?: Record<string, unknown>
    hourly?: {
      time?: string[]
      precipitation_probability?: unknown[]
      soil_moisture_0_to_1cm?: unknown[]
      soil_moisture_9_to_27cm?: unknown[]
      soil_temperature_6cm?: unknown[]
    }
  }

  const idx = nearestHourIndex(data.hourly?.time)
  const name = await reverseName(lat, lon)

  return {
    location: {
      latitude: roundCoord(lat),
      longitude: roundCoord(lon),
      name,
      accuracyM,
    },
    current: {
      temperatureC: num(data.current?.temperature_2m),
      humidity: num(data.current?.relative_humidity_2m),
      rainMm: num(data.current?.precipitation),
      weatherCode: num(data.current?.weather_code),
    },
    forecast: {
      rainProbabilityPercent: maxNearby(data.hourly?.precipitation_probability, idx, 12),
    },
    soil: {
      moisture0to1cm: num(data.hourly?.soil_moisture_0_to_1cm?.[idx ?? 0]),
      moisture9to27cm: num(data.hourly?.soil_moisture_9_to_27cm?.[idx ?? 0]),
      temperature6cm: num(data.hourly?.soil_temperature_6cm?.[idx ?? 0]),
      moistureKind: "modelled",
    },
    observedAt: typeof data.current?.time === "string" ? data.current.time : new Date().toISOString(),
    source: "Open-Meteo",
  }
}

export async function geocodePlace(query: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`
  const response = await fetch(url)
  if (!response.ok) throw new Error("geocode_unavailable")
  const data = (await response.json()) as {
    results?: { latitude: number; longitude: number; name: string; admin1?: string; country?: string }[]
  }
  const hit = data.results?.[0]
  if (!hit) return null
  const name = [hit.name, hit.admin1, hit.country].filter(Boolean).join(", ")
  return {
    latitude: hit.latitude,
    longitude: hit.longitude,
    name,
    city: hit.name,
    state: hit.admin1 ?? null,
    country: hit.country ?? null,
  }
}

export type ReversePlace = {
  latitude: number
  longitude: number
  locationName: string
  city: string | null
  state: string | null
  country: string | null
}

export async function reverseGeocode(lat: number, lon: number): Promise<ReversePlace> {
  const details = await reverseDetails(lat, lon)
  return {
    latitude: roundCoord(lat),
    longitude: roundCoord(lon),
    locationName: details.locationName,
    city: details.city,
    state: details.state,
    country: details.country,
  }
}

async function reverseName(lat: number, lon: number) {
  const details = await reverseDetails(lat, lon)
  return details.locationName || null
}

async function reverseDetails(lat: number, lon: number) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&format=json`,
      { headers: { "User-Agent": "RipeRoute/1.0 farm-intelligence" } },
    )
    if (!response.ok) {
      return { locationName: "", city: null, state: null, country: null }
    }
    const data = (await response.json()) as {
      address?: {
        city?: string
        town?: string
        village?: string
        county?: string
        state_district?: string
        state?: string
        country?: string
      }
    }
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      data.address?.state_district ||
      null
    const state = data.address?.state ?? null
    const country = data.address?.country ?? null
    const parts = [city, state, country].filter(Boolean)
    return {
      locationName: parts.length ? parts.join(", ") : "",
      city,
      state,
      country,
    }
  } catch {
    return { locationName: "", city: null, state: null, country: null }
  }
}

function nearestHourIndex(times: string[] | undefined) {
  if (!times?.length) return null
  const now = Date.now()
  let best = 0
  let bestDiff = Infinity
  times.forEach((time, index) => {
    const diff = Math.abs(new Date(time).getTime() - now)
    if (diff < bestDiff) {
      best = index
      bestDiff = diff
    }
  })
  return best
}

function maxNearby(values: unknown[] | undefined, start: number | null, hours: number) {
  if (!values?.length || start == null) return null
  let max: number | null = null
  for (let i = start; i < Math.min(values.length, start + hours); i += 1) {
    const n = num(values[i])
    if (n == null) continue
    max = max == null ? n : Math.max(max, n)
  }
  return max
}

function roundCoord(value: number) {
  return Math.round(value * 100) / 100
}
