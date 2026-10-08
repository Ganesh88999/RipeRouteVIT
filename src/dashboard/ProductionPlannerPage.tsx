import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { planProduction } from "../lib/feasibility"
import { listRequests } from "../lib/demandNetwork"
import { FeatureFrame } from "./FeatureFrame"
import { useDemandNetwork } from "./FarmProfileContext"
import { useLiveFarm } from "./liveFarm"
import { SurplusSplit } from "./SurplusSplit"

export function ProductionPlannerPage() {
  const { t } = useTranslation()
  const { farmerProfile } = useDemandNetwork()
  const { harvestKg, demandKg, setHarvestPlan } = useLiveFarm()
  const [crop, setCrop] = useState(farmerProfile?.selectedCrop || "Tomato")
  const [acres, setAcres] = useState(String(farmerProfile?.farmSizeAcres ?? 2))
  const [planned, setPlanned] = useState<ReturnType<typeof planProduction> | null>(null)

  const demandStats = useMemo(() => {
    const open = listRequests().filter(
      (r) =>
        r.crop.toLowerCase() === crop.toLowerCase() &&
        (r.status === "matching" || r.status === "partially_filled"),
    )
    const total = open.reduce((s, r) => s + Math.max(0, r.quantityKg - r.filledKg), 0)
    const mid = total > 0 ? total : 3700
    return {
      low: Math.round(mid * 0.92),
      high: Math.round(mid * 1.05),
      mid,
      fromRequests: total > 0,
    }
  }, [crop, farmerProfile])

  return (
    <FeatureFrame title={t("dash.plannerTitle")} subtitle={t("dash.plannerSub")}>
      <form
        className="mb-5 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault()
          const size = Number(acres) || 1
          const result = planProduction({
            farmSizeAcres: size,
            crop,
            demandMidKg: demandStats.mid,
            demandLowKg: demandStats.low,
            demandHighKg: demandStats.high,
          })
          setPlanned(result)
          setHarvestPlan(result.expectedYield, result.demandMid)
        }}
      >
        <label className="text-sm">
          <span className="text-ink-muted">{t("dash.preferredCrop")}</span>
          <input
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm">
          <span className="text-ink-muted">{t("dash.farmSizeAcres")}</span>
          <input
            value={acres}
            onChange={(e) => setAcres(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </label>
        <p className="sm:col-span-2 text-[12px] text-ink-muted">
          {t("dash.location")}: {farmerProfile?.locationName || t("dash.setInOnboarding")} · {t("dash.waterLabel")}:{" "}
          {farmerProfile?.irrigation || "—"}
        </p>
        <button type="submit" className="dash-btn dash-btn-primary sm:col-span-2">
          {t("dash.planMyCrop")}
        </button>
      </form>

      {planned ? (
        <div className="mb-5 dash-card p-4 text-sm">
          <p className="text-[11px] tracking-[0.14em] uppercase text-leaf">{t("dash.modelledRecommendation")}</p>
          <p className="mt-2 font-medium">
            {t("dash.recommendedCrop")}: {planned.recommendedCrop}
          </p>
          <p>
            {t("dash.recommendedArea")}: {planned.recommendedArea} {t("dash.acresUnit")}
          </p>
          <p>
            {t("dash.expectedYieldLabel")}: ~{formatKg(planned.expectedYield)}
          </p>
          <p>
            {t("dash.expectedDemandAtHarvest")}: {formatKg(planned.demandLow)}–{formatKg(planned.demandHigh)}{" "}
            <span className="text-ink-muted">
              ({t("dash.confidenceParen")} {planned.confidence}%)
            </span>
          </p>
          <p>
            {t("dash.recommendedProductionTarget")}: {formatKg(planned.demandMid)}
          </p>
          <p>
            {t("dash.projectedSurplus")}: ~{formatKg(planned.projectedSurplus)}
          </p>
          <p>
            {t("dash.projectedRisk")}: {planned.risk}
          </p>
          {!demandStats.fromRequests ? (
            <p className="mt-2 text-[12px] text-ink-muted">{t("dash.demandRangeModelled")}</p>
          ) : null}
        </div>
      ) : null}

      <p className="mb-3 text-sm font-medium">{t("dash.yieldSurplusFromPlan")}</p>
      <p className="mb-3 text-[12px] text-ink-muted">
        {t("dash.currentHarvestPlan")}: {harvestKg != null ? formatKg(harvestKg) : "—"} {t("dash.vsDemand")}{" "}
        {demandKg != null ? formatKg(demandKg) : "—"}
      </p>
      <SurplusSplit showRun />
      <Link to="/buyer-requests" className="dash-btn mt-4 inline-flex text-[12px]">
        {t("dash.viewBuyerRequests")}
      </Link>
    </FeatureFrame>
  )
}

export function DemandOpportunitiesPage() {
  const { t } = useTranslation()
  const { role, requests, buyerProfile } = useDemandNetwork()
  const open = requests.filter((r) => r.status === "matching" || r.status === "partially_filled")

  return (
    <FeatureFrame title={t("dash.demandOppTitle")} subtitle={t("dash.demandOppSub")}>
      {role === "buyer" ? (
        <Link to="/buyer-dashboard" className="dash-btn dash-btn-primary mb-4 inline-flex">
          {t("dash.createRequest")}
        </Link>
      ) : null}
      {open.length === 0 ? (
        <div className="dash-card p-5">
          <p className="text-sm">{t("dash.noMatchingBuyerRequests")}</p>
          <p className="mt-1 text-[12px] text-ink-muted">{t("dash.demandWillAppear")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {open.map((r) => (
            <li key={r.id} className="dash-card p-3 text-sm">
              <p className="font-medium">
                {r.crop} · {formatKg(r.quantityKg - r.filledKg)} · ₹{r.pricePerKg}/KG
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {r.buyerName} · {t("dash.needed")} {new Date(r.neededBy).toLocaleDateString()} · {r.locationName}
              </p>
            </li>
          ))}
        </ul>
      )}
      {role === "farmer" ? (
        <Link to="/buyer-requests" className="dash-btn mt-4 inline-flex">
          {t("dash.viewRequests")}
        </Link>
      ) : null}
      {role === "buyer" && buyerProfile ? (
        <p className="mt-3 text-[12px] text-ink-muted">{t("dash.publishingFromBuyerDash")}</p>
      ) : null}
    </FeatureFrame>
  )
}
