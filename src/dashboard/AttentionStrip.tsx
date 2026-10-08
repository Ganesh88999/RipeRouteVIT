import { Droplets, TriangleAlert, Truck } from "lucide-react"
import { Link } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"
import { useLiveFarm } from "./liveFarm"

export function AttentionStrip() {
  const { t, kickerClass } = useTranslation()
  const { weather, harvestKg } = useLiveFarm()
  const rain = weather?.forecast.rainProbabilityPercent

  const items = [
    {
      id: "yield",
      icon: TriangleAlert,
      title: t("dash.surplusRisk"),
      body: harvestKg == null ? t("dash.awaitingHarvestPlan") : t("dash.reviewMatches"),
      action: t("dash.addHarvest"),
      cta: t("dash.viewDetails"),
      href: "/yield-surplus",
    },
    {
      id: "irrigation",
      icon: Droplets,
      title: t("dash.irrigation"),
      body:
        rain == null
          ? t("dash.awaitingWeather")
          : `${t("dash.rainProb")} ${Math.round(rain)}% · ${weather?.source ?? ""}`,
      action: t("dash.navIrrigate"),
      cta: t("dash.viewDetails"),
      href: "/irrigation",
    },
    {
      id: "logistics",
      icon: Truck,
      title: t("dash.logisticsIntel"),
      body: t("dash.awaitingFarmData"),
      action: t("dash.viewDetails"),
      cta: t("dash.viewDetails"),
      href: "/logistics",
    },
  ] as const

  return (
    <section className="dash-card p-4 sm:p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.attention")}</p>
      <ul className="mt-4 grid gap-3 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.id} className="border border-line px-3 py-3">
              <p className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-4 w-4 text-forest" strokeWidth={1.7} />
                {item.title}
              </p>
              <p className="mt-2 text-[13px] leading-snug text-ink-muted">{item.body}</p>
              <p className="mt-2 text-[12px] text-ink">{item.action}</p>
              <Link to={item.href} className="dash-btn mt-3 inline-flex text-[12px]">
                {item.cta}
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
