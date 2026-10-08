import { motion } from "framer-motion"
import { useState } from "react"
import { useAuth } from "../auth/auth-context"
import { farmProfile } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"
import { AiApiError, analyzeCropImage, analyzeFarmProfile, type CropAnalysis, type FarmAnalysis } from "../lib/aiApi"
import { CropPhotoCapture, type CropPhoto } from "./CropPhotoCapture"
import { FeatureFrame } from "./FeatureFrame"
import { soilPctFromWeather, useLiveFarm } from "./liveFarm"
import { operatorName } from "./operator"

export function FarmAdvisorPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { weather } = useLiveFarm()
  const owner = operatorName(user, t("dash.farmer"))
  const [photo, setPhoto] = useState<CropPhoto | null>(null)
  const [crop, setCrop] = useState<CropAnalysis | null>(null)
  const [farm, setFarm] = useState<FarmAnalysis | null>(null)
  const [location, setLocation] = useState<string>(farmProfile.region)
  const [area, setArea] = useState(t("dash.acres"))
  const [stage, setStage] = useState<string>(farmProfile.stage)
  const [cropHint, setCropHint] = useState(t("dash.tomato"))
  const [status, setStatus] = useState<"idle" | "crop" | "farm">("idle")
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<string | null>(null)

  const runCrop = async () => {
    if (!photo) {
      setError(t("dash.photoRequired"))
      return
    }
    setError(null)
    setFarm(null)
    setStatus("crop")
    try {
      const result = await analyzeCropImage({
        image: photo.dataUrl,
        mimeType: photo.mimeType,
        crop: cropHint,
        location,
        growthStage: stage,
      })
      setCrop(result)
    } catch (err) {
      setCrop(null)
      setError(err instanceof AiApiError ? err.message : t("dash.aiFailed"))
    } finally {
      setStatus("idle")
    }
  }

  const runFarm = async () => {
    if (!location.trim() || !area.trim() || !stage.trim()) {
      setError(t("dash.farmFieldsRequired"))
      return
    }
    setError(null)
    setStatus("farm")
    try {
      const data = await analyzeFarmProfile({
        crop: crop?.likelyCrop || cropHint,
        location,
        area,
        growthStage: stage,
        ...(soilPctFromWeather(weather) != null ? { soilMoisture: soilPctFromWeather(weather)! } : {}),
        ...(weather?.forecast.rainProbabilityPercent != null
          ? { rainProb: weather.forecast.rainProbabilityPercent }
          : {}),
        ...(weather?.current.temperatureC != null ? { temperature: weather.current.temperatureC } : {}),
        imageNotes: crop
          ? `${crop.overallCondition}. ${crop.visibleStress}. ${crop.possibleIssues.join("; ")}`
          : undefined,
      })
      setFarm(data.result)
      setSource(data.source ?? "local")
    } catch (err) {
      setFarm(null)
      setError(err instanceof AiApiError ? err.message : t("dash.aiFailed"))
    } finally {
      setStatus("idle")
    }
  }

  return (
    <FeatureFrame title={t("dash.advisorTitle")} subtitle={t("dash.advisorSub")}>
      <p className="text-[12px] text-ink-muted">
        {t("dash.owner")}: {owner} · {farmProfile.farm}
      </p>
      {weather ? (
        <p className="mt-2 text-[12px] text-forest">
          {t("dash.liveWeatherUsed")}: {weather.location.name || `${weather.location.latitude}, ${weather.location.longitude}`}
          {weather.current.temperatureC != null ? ` · ${Math.round(weather.current.temperatureC)}°C` : ""}
        </p>
      ) : (
        <p className="mt-2 text-[12px] text-ink-muted">{t("dash.loadWeatherHint")}</p>
      )}

      <div className="mt-5">
        <CropPhotoCapture
          photo={photo}
          onChange={(next) => {
            setPhoto(next)
            setCrop(null)
            setFarm(null)
          }}
        />
      </div>

      <button
        type="button"
        className="dash-btn dash-btn-primary mt-4"
        disabled={status !== "idle"}
        onClick={() => void runCrop()}
      >
        {status === "crop" ? t("dash.analyzingImage") : t("dash.analyzeCrop")}
      </button>
      {status === "crop" ? (
        <p className="mt-2 text-[12px] text-ink-muted">{t("dash.analyzingSteps")}</p>
      ) : null}

      {crop ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dash-card mt-5 p-4">
          <p className="text-[11px] text-ink-muted">{t("dash.aiAssisted")}</p>
          <p className="mt-2 text-lg font-medium">
            {t("dash.likelyCrop")}: {crop.likelyCrop}
          </p>
          <p className="text-sm">
            {t("dash.confidence")}: {crop.confidence}%
          </p>
          <p className="mt-2 text-sm">{crop.overallCondition}</p>
          <p className="mt-1 text-sm text-ink-muted">{crop.visibleStress}</p>
          {crop.possibleIssues.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {crop.possibleIssues.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-[12px] text-amber">{t("dash.expertConfirm")}</p>
        </motion.div>
      ) : null}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Field label={t("dash.crop")} value={cropHint} onChange={setCropHint} />
        <Field label={t("dash.location")} value={location} onChange={setLocation} />
        <Field label={t("dash.area")} value={area} onChange={setArea} />
        <Field label={t("dash.growthStage")} value={stage} onChange={setStage} />
      </div>
      <p className="mt-3 text-sm text-ink-muted">{t("dash.soilDisclaimer")}</p>

      {error ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p className="text-sm text-urgent">{error}</p>
          <button type="button" className="dash-btn" onClick={() => void (crop ? runFarm() : runCrop())}>
            {t("dash.tryAgain")}
          </button>
        </div>
      ) : null}

      <button type="button" className="dash-btn dash-btn-primary mt-4" disabled={status !== "idle"} onClick={() => void runFarm()}>
        {status === "farm" ? t("dash.analyzingFarm") : t("dash.analyzeFarm")}
      </button>

      {farm ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dash-card mt-5 space-y-2 p-4">
          <p className="text-sm font-medium">
            {t("dash.farmAnalysisComplete")} {source === "local" ? `· ${t("dash.localAssessment")}` : ""}
          </p>
          <Row label={t("dash.cropCondition")} value={farm.cropCondition} />
          <Row label={t("dash.weatherRisk")} value={farm.weatherRisk} />
          <Row label={t("dash.irrigation")} value={farm.irrigationRecommendation} />
          <Row label={t("dash.potentialStress")} value={farm.potentialStress} />
          <Row label={t("dash.nextAction")} value={farm.nextAction} />
          <p className="pt-2 text-sm text-ink-muted">{farm.summary}</p>
        </motion.div>
      ) : null}
    </FeatureFrame>
  )
}

export function CropHealthPage() {
  const { t } = useTranslation()
  const [photo, setPhoto] = useState<CropPhoto | null>(null)
  const [crop, setCrop] = useState<CropAnalysis | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const run = async () => {
    if (!photo) {
      setError(t("dash.photoRequired"))
      return
    }
    setError(null)
    setBusy(true)
    try {
      const result = await analyzeCropImage({
        image: photo.dataUrl,
        mimeType: photo.mimeType,
      })
      setCrop(result)
    } catch (err) {
      setCrop(null)
      setError(err instanceof AiApiError ? err.message : t("dash.aiFailed"))
    } finally {
      setBusy(false)
    }
  }

  return (
    <FeatureFrame title={t("dash.cropHealthTitle")} subtitle={t("dash.aiAssisted")}>
      <CropPhotoCapture
        photo={photo}
        onChange={(next) => {
          setPhoto(next)
          setCrop(null)
        }}
      />
      <button type="button" className="dash-btn dash-btn-primary mt-4" disabled={busy} onClick={() => void run()}>
        {busy ? t("dash.analyzingImage") : t("dash.analyzeCrop")}
      </button>
      {busy ? <p className="mt-2 text-[12px] text-ink-muted">{t("dash.analyzingSteps")}</p> : null}
      {error ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <p className="text-sm text-urgent">{error}</p>
          <button type="button" className="dash-btn" onClick={() => void run()}>
            {t("dash.tryAgain")}
          </button>
        </div>
      ) : null}
      {crop ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="dash-card mt-5 p-4">
          <p className="text-lg font-medium">{crop.overallCondition}</p>
          <p className="mt-2 text-sm">
            {t("dash.likelyCrop")}: {crop.likelyCrop} · {t("dash.confidence")}: {crop.confidence}%
          </p>
          <p className="mt-2 text-sm">{crop.visibleStress}</p>
          {crop.possibleIssues.length ? (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {crop.possibleIssues.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {crop.recommendations.length ? (
            <ul className="mt-3 space-y-1 text-sm">
              {crop.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {crop.possibleIssues.length ? (
            <div className="mt-4 border-t border-line pt-3">
              <p className="text-[11px] text-amber">{t("dash.possibleIssue")}</p>
              <p className="mt-1 text-sm font-medium">{crop.possibleIssues[0]}</p>
              <p className="mt-1 text-sm">
                {t("dash.confidence")}: {crop.confidence}%
              </p>
              <p className="mt-3 text-sm font-medium">{t("dash.whatToDoNow")}</p>
              <ol className="mt-2 list-decimal pl-5 text-sm text-ink-muted">
                <li>{t("dash.issueStep1")}</li>
                <li>{t("dash.issueStep2")}</li>
                <li>{t("dash.issueStep3")}</li>
                <li>{t("dash.issueStep4")}</li>
                <li>{t("dash.issueStep5")}</li>
              </ol>
              <p className="mt-3 text-[12px]">{t("dash.noInventedPesticide")}</p>
            </div>
          ) : null}
          <p className="mt-3 text-[12px] text-amber">{t("dash.expertConfirm")}</p>
        </motion.div>
      ) : null}
    </FeatureFrame>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="text-sm">
      <span className="text-ink-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line px-3 py-2"
      />
    </label>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-2 text-sm">
      <p className="text-ink-muted">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  )
}
