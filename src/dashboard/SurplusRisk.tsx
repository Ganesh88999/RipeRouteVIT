import { opsHarvest } from "../data/dashboardDemo"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"

export function SurplusRisk() {
  const { t, kickerClass } = useTranslation()

  return (
    <section className="border border-amber/40 bg-[color-mix(in_srgb,var(--color-amber)_8%,white)] p-5 sm:p-6">
      <p className={`text-[11px] text-amber ${kickerClass}`}>{t("dash.surplusRisk")}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="font-display text-4xl text-forest">{formatKg(opsHarvest.surplusKg)}</p>
        <span className="rounded-md border border-amber/40 px-2 py-1 text-[11px] text-amber">
          {t("dash.high")}
        </span>
      </div>
      <ul className="mt-5 space-y-2 text-sm">
        <Row label={t("dash.predHarvest")} value={formatKg(opsHarvest.expectedKg)} />
        <Row label={t("dash.predDemand")} value={formatKg(opsHarvest.demandKg)} />
        <Row label={t("dash.buyerDemandAvail")} value={formatKg(opsHarvest.buyerMatchKg)} />
        <Row label={t("dash.rescueOpp")} value={formatKg(opsHarvest.rescueKg)} />
      </ul>
      <p className="mt-4 text-[12px] text-ink-muted">{t("dash.demoViz")}</p>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex justify-between gap-3 border-b border-amber/20 py-1.5">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </li>
  )
}
