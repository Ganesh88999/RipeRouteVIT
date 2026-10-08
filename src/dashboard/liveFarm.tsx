import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { WeatherPayload } from "../lib/weatherApi"

type LiveFarm = {
  weather: WeatherPayload | null
  setWeather: (value: WeatherPayload | null) => void
  harvestKg: number | null
  demandKg: number | null
  setHarvestPlan: (harvestKg: number | null, demandKg: number | null) => void
}

const LiveFarmContext = createContext<LiveFarm | null>(null)

export function LiveFarmProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<WeatherPayload | null>(null)
  const [harvestKg, setHarvestKg] = useState<number | null>(null)
  const [demandKg, setDemandKg] = useState<number | null>(null)

  const value = useMemo<LiveFarm>(
    () => ({
      weather,
      setWeather,
      harvestKg,
      demandKg,
      setHarvestPlan: (nextHarvest, nextDemand) => {
        setHarvestKg(nextHarvest)
        setDemandKg(nextDemand)
      },
    }),
    [demandKg, harvestKg, weather],
  )

  return <LiveFarmContext.Provider value={value}>{children}</LiveFarmContext.Provider>
}

export function useLiveFarm() {
  const ctx = useContext(LiveFarmContext)
  if (!ctx) {
    return {
      weather: null,
      setWeather: () => undefined,
      harvestKg: null,
      demandKg: null,
      setHarvestPlan: () => undefined,
    } satisfies LiveFarm
  }
  return ctx
}

export function soilPctFromWeather(weather: WeatherPayload | null) {
  if (!weather) return null
  const frac = weather.soil.moisture9to27cm ?? weather.soil.moisture0to1cm
  if (frac == null) return null
  return frac <= 1 ? Math.round(frac * 1000) / 10 : frac
}
