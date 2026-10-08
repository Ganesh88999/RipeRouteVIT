import { Link } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"
import { useLiveFarm } from "./liveFarm"

export function MarketSupplyPanels() {
  const { t, kickerClass } = useTranslation()
  const { harvestKg, demandKg } = useLiveFarm()
  const surplus = harvestKg != null && demandKg != null ? Math.max(0, harvestKg - demandKg) : null

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="dash-card p-5">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.bestBuyer")}</p>
        <p className="mt-3 text-sm text-ink-muted">{t("dash.awaitingFarmData")}</p>
        {surplus != null ? (
          <p className="mt-2 text-sm">
            {t("dash.potentialSurplus")}: {surplus} KG
          </p>
        ) : null}
        <Link to="/buyer-matching" className="dash-btn mt-4 inline-flex text-[12px]">
          {t("dash.viewAllMatches")}
        </Link>
      </section>
      <section className="dash-card p-5">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.recommendedRoute")}</p>
        <p className="mt-3 text-sm text-ink-muted">{t("dash.awaitingFarmData")}</p>
        <Link to="/logistics" className="dash-btn mt-4 inline-flex text-[12px]">
          {t("dash.viewDetails")}
        </Link>
      </section>
      <section className="dash-card p-5">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.rescueTitle")}</p>
        <p className="mt-3 text-sm text-ink-muted">{t("dash.awaitingFarmData")}</p>
        <Link to="/food-rescue" className="dash-btn mt-4 inline-flex text-[12px]">
          {t("dash.viewRescue")}
        </Link>
      </section>
    </div>
  )
}
