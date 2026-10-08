import { farmProfile, logistics, opsHarvest } from "../data/dashboardDemo"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"

export function FarmToMarketStrip() {
  const { t, kickerClass } = useTranslation()

  const stages = [
    { id: "farm", title: t("dash.chainFarm"), meta: t("dash.healthy") },
    { id: "health", title: t("dash.chainHealth"), meta: "92%" },
    { id: "harvest", title: t("dash.chainHarvest"), meta: formatKg(opsHarvest.expectedKg) },
    { id: "surplus", title: t("dash.chainSurplus"), meta: formatKg(opsHarvest.surplusKg) },
    { id: "demand", title: t("dash.chainDemand"), meta: formatKg(opsHarvest.demandKg) },
    { id: "buyer", title: t("dash.chainBuyer"), meta: formatKg(opsHarvest.buyerMatchKg) },
    { id: "log", title: t("dash.chainLog"), meta: logistics.eta },
    { id: "rescue", title: t("dash.chainRescue"), meta: formatKg(opsHarvest.rescueKg) },
    { id: "impact", title: t("dash.chainImpact"), meta: `500 KG ${t("dash.redirected")}` },
  ]

  return (
    <section id="chain" className="scroll-mt-20 border border-line bg-card p-4 sm:p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.chainTitle")}</p>
      <p className="mt-1 text-[12px] text-ink-muted">
        {farmProfile.crop} · {t("dash.demoViz")}
      </p>
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex min-w-[8.5rem] items-stretch gap-2">
            <article className="flex-1 border border-line px-3 py-3">
              <p className={`text-[9px] text-ink-muted ${kickerClass}`}>{stage.title}</p>
              <p className="mt-2 text-sm font-medium leading-snug">{stage.meta}</p>
            </article>
            {index < stages.length - 1 ? (
              <span className="self-center text-ink-muted" aria-hidden>
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
