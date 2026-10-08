import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { farmProfile } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"
import { soilPctFromWeather, useLiveFarm } from "./liveFarm"

export function IntelligencePanels() {
  const { t, kickerClass } = useTranslation()
  const { weather } = useLiveFarm()
  const soil = soilPctFromWeather(weather)

  return (
    <section className="dash-card p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.farmHealth")}</p>
      <p className="mt-1 text-[11px] text-ink-muted">
        {farmProfile.farm} · {t("dash.userProvidedFarm")}
      </p>
      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Row label={t("dash.crop")} value={t("dash.tomato")} />
        <Row
          label={t("dash.cropHealth")}
          value={t("dash.awaitingScan")}
        />
        <Row
          label={t("dash.weather")}
          value={
            weather?.current.temperatureC != null ? `${Math.round(weather.current.temperatureC)}°C` : t("dash.awaitingWeather")
          }
        />
        <Row
          label={t("dash.rainProb")}
          value={
            weather?.forecast.rainProbabilityPercent != null
              ? `${Math.round(weather.forecast.rainProbabilityPercent)}%`
              : t("dash.awaitingWeather")
          }
        />
        <Row
          label={t("dash.estimatedSoilMoisture")}
          value={soil != null ? `${soil}%` : t("dash.awaitingWeather")}
        />
        <Row label={t("dash.source")} value={weather?.source ?? t("dash.notAvailable")} />
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/farm-advisor" className="dash-btn dash-btn-primary text-[12px]">
          {t("dash.viewFarmAnalysis")}
        </Link>
        <Link to="/crop-health" className="dash-btn text-[12px]">
          {t("dash.navHealth")}
        </Link>
        <Link to="/irrigation" className="dash-btn text-[12px]">
          {t("dash.navIrrigate")}
        </Link>
      </div>
    </section>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-1.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
