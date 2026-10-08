import { Link } from "react-router-dom"
import { Bot, ChartColumn, Handshake, Truck } from "lucide-react"
import { useTranslation } from "../i18n/LanguageProvider"

const PURPOSES = [
  "Monitoring crop and field conditions.",
  "Forecasting harvest and surplus.",
  "Matching surplus to buyers and rescue.",
  "Optimizing routes against shelf life.",
] as const

export function AgentPanels({
  active,
  onSelect,
  compact = false,
}: {
  active: number
  onSelect?: (index: number) => void
  compact?: boolean
}) {
  const { t, kickerClass } = useTranslation()

  const cards = [
    {
      id: "farm",
      icon: Bot,
      title: "Farm Intelligence",
      status: t("dash.farmActive"),
      body: PURPOSES[0],
      detailBody: t("dash.farmEvent"),
    },
    {
      id: "pred",
      icon: ChartColumn,
      title: "Predictive Engine",
      status: t("dash.predStatus"),
      body: PURPOSES[1],
      detailBody: t("dash.predEvent"),
    },
    {
      id: "demand",
      icon: Handshake,
      title: "Demand & Rescue",
      status: t("dash.demandStatus"),
      body: PURPOSES[2],
      detailBody: t("dash.demandEvent"),
    },
    {
      id: "log",
      icon: Truck,
      title: "Logistics & Action",
      status: t("dash.logStatus"),
      body: PURPOSES[3],
      detailBody: t("dash.logEvent"),
    },
  ]

  const highlight = [0, 1, 2, 3, 3][active] ?? 0

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2"}`}>
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <article
            key={card.id}
            className={`dash-card dash-card-hover p-4 text-left ${
              index === highlight ? "border-forest" : ""
            }`}
            onClick={onSelect ? () => onSelect(index) : undefined}
            role={onSelect ? "button" : undefined}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-4 w-4 text-forest" strokeWidth={1.7} />
                <h3 className="text-sm font-semibold leading-snug">{card.title}</h3>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1.5 text-[10px] text-leaf ${kickerClass}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-leaf dash-pulse" />
                {card.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-muted">{compact ? card.body : card.detailBody}</p>
            {compact ? (
              <Link to="/ai-agents" className="dash-btn mt-3 inline-flex text-[12px]" onClick={(e) => e.stopPropagation()}>
                Open
              </Link>
            ) : (
              <ul className="mt-3 space-y-1.5 text-[12px] text-ink-muted">
                <li>Role: {card.title}</li>
                <li>Current action: {card.detailBody}</li>
                <li>Purpose: {card.body}</li>
              </ul>
            )}
          </article>
        )
      })}
    </div>
  )
}
