import { Link } from "react-router-dom"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { useLiveFarm } from "./liveFarm"

export function OverviewSurplus() {
  const { t, kickerClass } = useTranslation()
  const { harvestKg, demandKg } = useLiveFarm()
  const ready = harvestKg != null && demandKg != null
  const surplus = ready ? Math.max(0, harvestKg - demandKg) : null

  return (
    <section className="dash-card p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.surplusTitle")}</p>
      <p className="mt-1 text-[12px] text-ink-muted">{t("dash.userProvidedData")}</p>
      {ready && surplus != null ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Metric value={formatKg(harvestKg)} label={t("dash.predHarvest")} />
          <Metric value={formatKg(demandKg)} label={t("dash.predDemand")} />
          <Metric value={formatKg(surplus)} label={t("dash.potentialSurplus")} warn />
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-muted">{t("dash.awaitingHarvestPlan")}</p>
      )}
      <Link to="/yield-surplus" className="dash-btn dash-btn-primary mt-4 inline-flex text-[12px]">
        {t("dash.viewDetails")}
      </Link>
    </section>
  )
}

function Metric({ value, label, warn }: { value: string; label: string; warn?: boolean }) {
  return (
    <div className={`border px-3 py-3 ${warn ? "border-amber/40 bg-amber/5" : "border-line"}`}>
      <p className={`font-display text-2xl ${warn ? "text-amber" : "text-ink"}`}>{value}</p>
      <p className="mt-1 text-[12px] text-ink-muted">{label}</p>
    </div>
  )
}
