import { Link } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"

export function AlertCenter() {
  const { t, kickerClass } = useTranslation()
  const alerts = [
    {
      level: t("dash.high"),
      color: "text-urgent border-urgent/30",
      title: t("dash.alertHigh"),
      rec: t("dash.alertHighRec"),
      to: "/yield-surplus",
    },
    {
      level: t("dash.medium"),
      color: "text-amber border-amber/40",
      title: t("dash.alertMed"),
      rec: t("dash.alertMedRec"),
      to: "/logistics",
    },
    {
      level: t("dash.low"),
      color: "text-leaf border-leaf/30",
      title: t("dash.alertLow"),
      rec: t("dash.alertLowRec"),
      to: "/irrigation",
    },
  ]

  return (
    <section className="border border-line bg-card p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.alertsTitle")}</p>
      <ul className="mt-4 space-y-3">
        {alerts.map((alert) => (
          <li key={alert.title} className={`border px-3 py-3 ${alert.color}`}>
            <p className={`text-[10px] ${kickerClass}`}>{alert.level}</p>
            <p className="mt-1 text-sm font-medium text-ink">{alert.title}</p>
            <p className="mt-1 text-[12px] text-ink-muted">{alert.rec}</p>
            <Link to={alert.to} className="dash-btn mt-2 inline-flex text-[12px]">
              {t("dash.viewDetails")}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function QuickActions() {
  const { t, kickerClass } = useTranslation()
  const actions = [
    { label: t("dash.scanCrop"), to: "/crop-health" },
    { label: t("dash.runFarm"), to: "/farm-advisor" },
    { label: t("dash.findBuyers"), to: "/buyer-matching" },
    { label: t("dash.optimizeRoute"), to: "/logistics" },
    { label: t("dash.planRescue"), to: "/food-rescue" },
    { label: t("dash.askAdvisor"), to: "/farm-advisor" },
    { label: t("dash.checkSchemes"), to: "/government-schemes" },
  ]

  return (
    <section className="border border-line bg-card p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.quickTitle")}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((item) => (
          <Link
            key={item.label}
            to={item.to}
            className="rounded-full border border-line px-3 py-1.5 text-[12px] hover:border-forest hover:bg-canvas-warm"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
