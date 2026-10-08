import { motion } from "framer-motion"
import { useState } from "react"
import { CountUp } from "../components/CountUp"
import { useTranslation } from "../i18n/LanguageProvider"
import { AiApiError } from "../lib/aiApi"
import {
  fetchLiveWeather,
  geocodeLocation,
  runIrrigationAnalysis,
  type IrrigationAnalysisResult,
  type WeatherPayload,
} from "../lib/weatherApi"
import { FeatureFrame } from "./FeatureFrame"
import { soilPctFromWeather, useLiveFarm } from "./liveFarm"

type LocStatus = "idle" | "locating" | "found" | "denied" | "unavailable"

function fmt(value: number | null, suffix = "") {
  if (value == null) return null
  return `${Math.round(value * 10) / 10}${suffix}`
}

function relativeTime(iso: string | null) {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return "just now"
  const min = Math.round(ms / 60000)
  if (min < 1) return "just now"
  if (min === 1) return "1 min ago"
  if (min < 60) return `${min} min ago`
  return `${Math.round(min / 60)} h ago`
}

export function IrrigationPage() {
  const { t } = useTranslation()
  const { weather, setWeather } = useLiveFarm()
  const [crop, setCrop] = useState(t("dash.tomato"))
  const [stage, setStage] = useState("Flowering / Fruiting")
  const [locStatus, setLocStatus] = useState<LocStatus>("idle")
  const [weatherBusy, setWeatherBusy] = useState(false)
  const [analysisBusy, setAnalysisBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualOpen, setManualOpen] = useState(false)
  const [placeQuery, setPlaceQuery] = useState("")
  const [manualLat, setManualLat] = useState("")
  const [manualLon, setManualLon] = useState("")
  const [result, setResult] = useState<IrrigationAnalysisResult | null>(null)

  const loadWeather = async (lat: number, lon: number, accuracy?: number) => {
    setWeatherBusy(true)
    setError(null)
    setResult(null)
    try {
      const next = await fetchLiveWeather(lat, lon, accuracy)
      setWeather(next)
      setLocStatus("found")
    } catch (err) {
      setWeather(null)
      setError(err instanceof AiApiError ? err.message : t("dash.weatherFailed"))
    } finally {
      setWeatherBusy(false)
    }
  }

  const useLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("unavailable")
      setManualOpen(true)
      return
    }
    setLocStatus("locating")
    setError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void loadWeather(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy)
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setLocStatus("denied")
        else setLocStatus("unavailable")
        setManualOpen(true)
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 },
    )
  }

  const submitManual = async () => {
    setError(null)
    try {
      if (placeQuery.trim().length >= 2) {
        setWeatherBusy(true)
        const place = await geocodeLocation(placeQuery.trim())
        await loadWeather(place.latitude, place.longitude)
        return
      }
      const lat = Number(manualLat)
      const lon = Number(manualLon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
        setError(t("dash.enterLocationHint"))
        return
      }
      await loadWeather(lat, lon)
    } catch (err) {
      setError(err instanceof AiApiError ? err.message : t("dash.weatherFailed"))
      setWeatherBusy(false)
    }
  }

  const analyze = async () => {
    if (!weather) {
      setError(t("dash.needWeatherFirst"))
      return
    }
    setAnalysisBusy(true)
    setError(null)
    try {
      const next = await runIrrigationAnalysis({
        crop,
        growthStage: stage,
        location: {
          latitude: weather.location.latitude,
          longitude: weather.location.longitude,
        },
        weather: {
          temperatureC: weather.current.temperatureC,
          humidity: weather.current.humidity,
          rainProbabilityPercent: weather.forecast.rainProbabilityPercent,
          rainMm: weather.current.rainMm,
        },
        soil: weather.soil,
      })
      setResult(next)
    } catch (err) {
      setResult(null)
      setError(err instanceof AiApiError ? err.message : t("dash.irrigationFailed"))
    } finally {
      setAnalysisBusy(false)
    }
  }

  const soilPct = soilPctFromWeather(weather)
  const rainBar = weather?.forecast.rainProbabilityPercent ?? null

  return (
    <FeatureFrame title={t("dash.irrigationTitle")} subtitle={t("dash.liveWeatherSub")}>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="dash-btn dash-btn-primary" onClick={useLocation} disabled={locStatus === "locating"}>
          {locStatus === "locating" ? t("dash.locating") : t("dash.useMyLocation")}
        </button>
        <button type="button" className="dash-btn" onClick={() => weather && void loadWeather(weather.location.latitude, weather.location.longitude)} disabled={!weather || weatherBusy}>
          {t("dash.refreshData")}
        </button>
        <button type="button" className="dash-btn" onClick={() => setManualOpen((value) => !value)}>
          {t("dash.enterLocation")}
        </button>
      </div>
      <p className="mt-2 text-[12px] text-ink-muted">{statusLabel(locStatus, t)}</p>

      {manualOpen ? (
        <div className="dash-card mt-4 grid gap-3 p-4 sm:grid-cols-2">
          <label className="text-sm sm:col-span-2">
            <span className="text-ink-muted">{t("dash.cityOrPlace")}</span>
            <input value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="text-ink-muted">{t("dash.latitude")}</span>
            <input value={manualLat} onChange={(event) => setManualLat(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label className="text-sm">
            <span className="text-ink-muted">{t("dash.longitude")}</span>
            <input value={manualLon} onChange={(event) => setManualLon(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <button type="button" className="dash-btn dash-btn-primary sm:col-span-2" onClick={() => void submitManual()}>
            {t("dash.fetchWeather")}
          </button>
        </div>
      ) : null}

      {weatherBusy ? <p className="mt-4 text-sm text-ink-muted">{t("dash.fetchingWeather")}</p> : null}

      {weather ? (
        <WeatherPanel weather={weather} soilPct={soilPct} rainBar={rainBar} t={t} />
      ) : !weatherBusy ? (
        <p className="mt-4 text-sm text-ink-muted">{t("dash.noLiveWeather")}</p>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-ink-muted">{t("dash.crop")}</span>
          <input value={crop} onChange={(event) => setCrop(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="text-ink-muted">{t("dash.growthStage")}</span>
          <input value={stage} onChange={(event) => setStage(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
      </div>

      <button type="button" className="dash-btn dash-btn-primary mt-5" disabled={analysisBusy} onClick={() => void analyze()}>
        {analysisBusy ? t("dash.analyzingField") : t("dash.runIrrigation")}
      </button>

      {error ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-sm text-urgent">{error}</p>
          <button type="button" className="dash-btn" onClick={() => void (weather ? analyze() : useLocation())}>
            {t("dash.tryAgain")}
          </button>
        </div>
      ) : null}

      {result ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dash-card mt-5 p-5">
          <p className="text-[11px] text-leaf">{t("dash.irrigationTitle")}</p>
          <p className="mt-2 font-display text-2xl">{result.recommendation}</p>
          <p className="mt-4 text-sm font-medium">{t("dash.why")}</p>
          <ul className="mt-2 list-disc pl-5 text-sm text-ink-muted">
            {result.reason.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm">
            {t("dash.estimatedWaterNeed")}:{" "}
            {result.estimatedWaterNeedLiters == null ? t("dash.notAvailable") : `${result.estimatedWaterNeedLiters} L`}
          </p>
          <p className="mt-1 text-sm">
            {t("dash.nextReview")}: {result.hoursUntilReview}h
          </p>
          {result.explanation ? (
            <p className="mt-4 border-t border-line pt-3 text-sm">{result.explanation}</p>
          ) : null}
          <p className="mt-3 text-[12px] text-amber">{t("dash.modelledSoilNote")}</p>
        </motion.div>
      ) : null}
    </FeatureFrame>
  )
}

function WeatherPanel({
  weather,
  soilPct,
  rainBar,
  t,
}: {
  weather: WeatherPayload
  soilPct: number | null
  rainBar: number | null
  t: (key: string) => string
}) {
  return (
    <section className="dash-card mt-4 p-5">
      <p className="text-[11px] text-leaf">{t("dash.currentConditions")}</p>
      <p className="mt-2 text-lg font-medium">
        {weather.location.name || `${weather.location.latitude}, ${weather.location.longitude}`}
      </p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <Metric label={t("dash.weather")} value={weather.current.temperatureC} suffix="°C" />
        <Metric label={t("dash.humidity")} value={weather.current.humidity} suffix="%" />
        <Metric label={t("dash.rainProb")} value={weather.forecast.rainProbabilityPercent} suffix="%" />
        <Metric label={t("dash.rainfall")} value={weather.current.rainMm} suffix=" mm" />
        <div>
          <p className="text-[12px] text-ink-muted">{t("dash.estimatedSoilMoisture")}</p>
          <p className="font-display text-2xl">{fmt(soilPct, "%") ?? t("dash.notAvailable")}</p>
          {rainBar != null ? (
            <div className="mt-2 h-1.5 bg-line">
              <motion.div className="h-full bg-forest" initial={{ width: 0 }} animate={{ width: `${Math.min(100, rainBar)}%` }} />
            </div>
          ) : null}
        </div>
        <Metric label={t("dash.soilTemp")} value={weather.soil.temperature6cm} suffix="°C" />
      </dl>
      <p className="mt-4 text-[12px] text-ink-muted">
        {t("dash.lastUpdated")}: {relativeTime(weather.observedAt) ?? t("dash.notAvailable")} · {t("dash.source")}: {weather.source}
      </p>
    </section>
  )
}

function Metric({ label, value, suffix }: { label: string; value: number | null; suffix: string }) {
  const { t } = useTranslation()
  return (
    <div>
      <p className="text-[12px] text-ink-muted">{label}</p>
      <p className="font-display text-2xl">
        {value == null ? t("dash.notAvailable") : <CountUp target={value} suffix={suffix} durationMs={600} />}
      </p>
    </div>
  )
}

function statusLabel(status: LocStatus, t: (key: string) => string) {
  if (status === "locating") return t("dash.locating")
  if (status === "found") return t("dash.locationFound")
  if (status === "denied") return t("dash.locationDenied")
  if (status === "unavailable") return t("dash.locationUnavailable")
  return t("dash.locationIdle")
}
