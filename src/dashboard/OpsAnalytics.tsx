import { useState } from "react"
import { analyticsSeries } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

type Filter = "24h" | "7d" | "30d"

function sliceFor(filter: Filter, series: readonly number[]) {
  if (filter === "24h") return series.slice(-3)
  if (filter === "7d") return series.slice(-4)
  return [...series]
}

function MiniBars({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values, 1)
  return (
    <svg viewBox={`0 0 ${values.length * 28} 72`} className="h-16 w-full">
      {values.map((value, index) => {
        const h = (value / max) * 60
        return (
          <rect
            key={index}
            x={index * 28 + 6}
            y={68 - h}
            width="14"
            height={h}
            fill={color}
            opacity={0.85}
          />
        )
      })}
    </svg>
  )
}

export function OpsAnalytics() {
  const { t, kickerClass } = useTranslation()
  const [filter, setFilter] = useState<Filter>("7d")

  const charts = [
    { key: "hd", title: t("dash.harvestVsDemand"), a: analyticsSeries.harvest, b: analyticsSeries.demand },
    { key: "surplus", title: t("dash.surplusChart"), a: analyticsSeries.surplus },
    { key: "water", title: t("dash.waterChart"), a: analyticsSeries.water },
    { key: "health", title: t("dash.healthChart"), a: analyticsSeries.health },
    { key: "demand", title: t("dash.demandChart"), a: analyticsSeries.demand },
    { key: "rescued", title: t("dash.rescuedChart"), a: analyticsSeries.rescued },
    { key: "value", title: t("dash.valueChart"), a: analyticsSeries.value },
  ]

  return (
    <section className="border border-line bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.analyticsTitle")}</p>
        <div className="flex gap-1">
          {(["24h", "7d", "30d"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-2.5 py-1 text-[11px] ${
                filter === item ? "bg-forest text-white" : "border border-line"
              }`}
            >
              {item === "24h" ? t("dash.filter24h") : item === "7d" ? t("dash.filter7d") : t("dash.filter30d")}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-ink-muted">{t("dash.demoViz")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {charts.map((chart) => (
          <article key={chart.key} className="border border-line p-3">
            <p className="text-[12px] text-ink-muted">{chart.title}</p>
            <MiniBars values={sliceFor(filter, chart.a)} color={chart.key === "surplus" ? "#d4a017" : "#1f6b45"} />
          </article>
        ))}
      </div>
    </section>
  )
}
