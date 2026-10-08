import { motion } from "framer-motion"
import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import {
  buyers,
  impactDemo,
  logistics,
  streamSeed,
} from "../data/dashboardDemo"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { AgentPanels } from "./AgentPanels"
import { CoordinationFlow } from "./CoordinationFlow"
import { DecisionStream } from "./DecisionStream"
import { FarmerSupportChat } from "./FarmerSupportChat"
import { FeatureFrame } from "./FeatureFrame"
import { FoodRescuePanel } from "./FoodRescuePanel"
import { ImpactStrip } from "./ImpactStrip"
import { SurplusSplit } from "./SurplusSplit"
import { SupportProjectPage } from "./SupportProjectPage"
import { useDemandNetwork } from "./FarmProfileContext"
import { useLiveFarm } from "./liveFarm"
import { operatorName } from "./operator"
import { useWorkspace } from "./workspace"

export { CropHealthPage, FarmAdvisorPage } from "./FarmAdvisorPage"
export { IrrigationPage } from "./IrrigationPage"
export { GovernmentSchemesPage } from "./GovernmentSchemesPage"

export function YieldSurplusPage() {
  const { t } = useTranslation()
  const { harvestKg, demandKg, setHarvestPlan } = useLiveFarm()
  const [harvest, setHarvest] = useState(harvestKg != null ? String(harvestKg) : "")
  const [demand, setDemand] = useState(demandKg != null ? String(demandKg) : "")

  return (
    <FeatureFrame title={t("dash.yieldSurplusTitle")} subtitle={t("dash.yieldSurplusSub")}>
      <Link to="/production-planner" className="dash-btn mb-4 inline-flex text-[12px]">
        {t("dash.openWhatShouldGrow")}
      </Link>
      <form
        className="mb-5 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const nextHarvest = Number(harvest)
          const nextDemand = Number(demand)
          if (!Number.isFinite(nextHarvest) || !Number.isFinite(nextDemand)) return
          setHarvestPlan(nextHarvest, nextDemand)
        }}
      >
        <label className="text-sm">
          <span className="text-ink-muted">{t("dash.predHarvest")} (KG)</span>
          <input value={harvest} onChange={(event) => setHarvest(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <label className="text-sm">
          <span className="text-ink-muted">{t("dash.predDemand")} (KG)</span>
          <input value={demand} onChange={(event) => setDemand(event.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
        </label>
        <button type="submit" className="dash-btn dash-btn-primary sm:col-span-2">
          {t("dash.runPrediction")}
        </button>
      </form>
      <SurplusSplit showRun />
    </FeatureFrame>
  )
}

export function MarketDemandPage() {
  return null
}

export function BuyerMatchingPage() {
  const { t } = useTranslation()
  const { selectedBuyerId, selectBuyer } = useWorkspace()
  const { harvestKg, demandKg } = useLiveFarm()
  const surplus = harvestKg != null && demandKg != null ? Math.max(0, harvestKg - demandKg) : null
  const [openId, setOpenId] = useState<string | null>(buyers[0].id)

  return (
    <FeatureFrame
      title={t("dash.matchingTitle")}
      subtitle={surplus == null ? t("dash.awaitingHarvestPlan") : `${formatKg(surplus)} ${t("dash.potentialSurplus")}`}
    >
      <ul className="space-y-3">
        {buyers.map((buyer) => (
          <li key={buyer.id} className="dash-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{buyer.name}</p>
              <p className="font-display text-xl">{buyer.match}%</p>
            </div>
            <p className="mt-1 text-sm text-ink-muted">
              {formatKg(buyer.kg)} · {buyer.km} KM · {buyer.demand}
            </p>
            <button type="button" className="dash-btn mt-3" onClick={() => setOpenId(buyer.id)}>
              {t("dash.viewMatch")}
            </button>
            {openId === buyer.id ? (
              <div className="mt-3 border-t border-line pt-3 text-sm">
                <p>{t("dash.predShelf")}: 16h</p>
                <p>
                  {t("dash.recommendedRoute")}: {logistics.origin} → {buyer.name}
                </p>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary mt-3"
                  onClick={() => selectBuyer(buyer.id)}
                >
                  {t("dash.selectBuyer")}
                </button>
                {selectedBuyerId === buyer.id ? (
                  <p className="mt-2 text-[12px] text-leaf">{t("dash.buyerSelectedLogistics")}</p>
                ) : null}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </FeatureFrame>
  )
}

export function LogisticsPage() {
  const { t } = useTranslation()
  const { selectedBuyer, routeOptimized, setRouteOptimized } = useWorkspace()
  const dest = selectedBuyer?.name ?? logistics.destination

  return (
    <FeatureFrame title={t("dash.logisticsIntel")} subtitle={t("dash.simulatedTelemetry")}>
      <div className="dash-card p-5">
        <p>🌱 {logistics.origin}</p>
        <p className="py-2 text-ink-muted">│ {logistics.distanceKm} KM</p>
        <p>🏪 {dest}</p>
        <dl className="mt-4 grid gap-2 sm:grid-cols-2">
          <Row label={t("dash.eta")} value={logistics.eta} />
          <Row label={t("dash.predShelf")} value={logistics.shelf} />
          <Row label={t("dash.routeRisk")} value={t("dash.low")} />
          <Row label={t("dash.coldChain")} value={t("dash.coldRequired")} />
        </dl>
        <button
          type="button"
          className="dash-btn dash-btn-primary mt-4"
          onClick={() => setRouteOptimized(true)}
        >
          {t("dash.optimizeRoute")}
        </button>
        {routeOptimized ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-leaf">
            {t("dash.e5")}
          </motion.p>
        ) : null}
      </div>
    </FeatureFrame>
  )
}

export function FoodRescuePage() {
  const { t } = useTranslation()

  return (
    <FeatureFrame title={t("dash.rescueTitle")} subtitle={t("dash.rescueSubtitle")}>
      <FoodRescuePanel />
    </FeatureFrame>
  )
}

export function FarmerSupportPage() {
  const { t } = useTranslation()
  return (
    <FeatureFrame title={t("dash.supportTitleFull")} subtitle={t("dash.supportSubtitle")}>
      <FarmerSupportChat />
    </FeatureFrame>
  )
}

export function SupportProjectRoute() {
  const { t } = useTranslation()
  return (
    <FeatureFrame title={t("dash.supportProjectTitle")} subtitle={t("dash.supportProjectSub")}>
      <SupportProjectPage />
    </FeatureFrame>
  )
}

export function AiAgentsPage() {
  const { t } = useTranslation()
  const [active, setActive] = useState(1)
  return (
    <FeatureFrame title={t("dash.navAgents")} subtitle={t("dash.coordTitle")}>
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <AgentPanels active={active} onSelect={setActive} />
        <CoordinationFlow active={active} />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          ["dash.agentRole", "dash.agentRoleBody"],
          ["dash.agentCurrentState", "dash.agentCurrentStateBody"],
          ["dash.agentInputs", "dash.agentInputsBody"],
          ["dash.agentOutputs", "dash.agentOutputsBody"],
        ].map(([labelKey, valueKey]) => (
          <div key={labelKey} className="dash-card p-4 text-sm">
            <p className="text-[11px] text-ink-muted">{t(labelKey)}</p>
            <p className="mt-1">{t(valueKey)}</p>
          </div>
        ))}
      </div>
    </FeatureFrame>
  )
}

export function AiDecisionsPage() {
  const { t } = useTranslation()
  const [open, setOpen] = useState<string | null>(null)

  return (
    <FeatureFrame title={t("dash.latestAiActions")} subtitle={t("dash.simulatedStream")}>
      <DecisionStream />
      <ul className="mt-6 space-y-2">
        {streamSeed.map((event) => (
          <li key={event.id}>
            <button
              type="button"
              className="dash-card w-full p-3 text-left"
              onClick={() => setOpen(open === event.id ? null : event.id)}
            >
              <p className="text-[12px] text-ink-muted">
                {event.time} · {t(event.agentKey)}
              </p>
              <p className="text-sm">{t(event.bodyKey)}</p>
              {open === event.id ? (
                <p className="mt-2 text-[12px] text-ink-muted">
                  {t("dash.agentActionDetail")} · {t(event.bodyKey)}
                </p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
    </FeatureFrame>
  )
}

export function ImpactPage() {
  const { t } = useTranslation()
  return (
    <FeatureFrame title={t("dash.impactEngine")} subtitle={t("dash.impactEngineSub")}>
      <ImpactStrip />
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="dash-card p-4">
          <p className="text-[11px] tracking-[0.16em] uppercase text-leaf">{t("dash.modelledCalculated")}</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              {t("dash.potentialFoodRescued")}: {formatKg(impactDemo.foodRescuedKg)}
            </li>
            <li>
              {t("dash.potentialValueRecovered")}: ₹{impactDemo.valueInr}
            </li>
            <li>
              {t("dash.estimatedCo2Avoided")}: {impactDemo.co2eKg} kg
            </li>
          </ul>
        </div>
        <div className="dash-card p-4">
          <p className="text-[11px] tracking-[0.16em] uppercase text-ink-muted">{t("dash.measuredImpact")}</p>
          <p className="mt-3 text-sm text-ink-muted">{t("dash.notConnectedYet")}</p>
        </div>
      </div>
    </FeatureFrame>
  )
}

export function SettingsPage() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const { role, farmerProfile, buyerProfile } = useDemandNetwork()
  return (
    <FeatureFrame title={t("dash.settings")}>
      <p className="text-sm">{operatorName(user, t("dash.farmer"))}</p>
      <p className="text-sm text-ink-muted">{user?.email}</p>
      <p className="mt-2 text-sm">
        {t("dash.roleLabel")}: <span className="font-medium capitalize">{role || "—"}</span>
      </p>
      {farmerProfile ? (
        <div className="mt-4 space-y-1 text-sm">
          <p>
            <span className="text-ink-muted">{t("dash.farmLocationLabel")}: </span>
            {farmerProfile.locationName}
          </p>
          <p>
            <span className="text-ink-muted">{t("dash.activeCropLabel")}: </span>
            {farmerProfile.selectedCrop}
          </p>
          <p>
            <span className="text-ink-muted">{t("dash.expectedHarvestLabel")}: </span>
            {farmerProfile.expectedHarvestKg != null ? `${farmerProfile.expectedHarvestKg} KG` : "—"}
          </p>
        </div>
      ) : null}
      {buyerProfile ? (
        <div className="mt-4 space-y-1 text-sm">
          <p>
            <span className="text-ink-muted">{t("dash.businessLabel")}: </span>
            {buyerProfile.businessName}
          </p>
          <p>
            <span className="text-ink-muted">{t("dash.location")}: </span>
            {buyerProfile.locationName}
          </p>
        </div>
      ) : null}
      {role === "farmer" ? (
        <Link to="/onboarding/farmer?update=1" className="dash-btn mt-4 inline-flex">
          {t("dash.updateFarmLocation")}
        </Link>
      ) : null}
      <button type="button" className="dash-btn mt-3 block" onClick={() => void signOut()}>
        {t("dash.signOut")}
      </button>
    </FeatureFrame>
  )
}

export function HelpPage() {
  const { t } = useTranslation()
  return (
    <FeatureFrame title={t("dash.help")} subtitle={t("dash.greetingSub")}>
      <ul className="space-y-2 text-sm">
        {[
          ["/farm-advisor", "dash.advisorTitle"],
          ["/buyer-matching", "dash.matchingTitle"],
          ["/government-schemes", "dash.schemesTitle"],
          ["/ai-agents", "dash.navAgents"],
        ].map(([to, key]) => (
          <li key={to}>
            <Link to={to} className="text-forest hover:underline">
              {t(key)}
            </Link>
          </li>
        ))}
      </ul>
    </FeatureFrame>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
