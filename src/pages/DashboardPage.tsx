import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { pulseKeys } from "../data/dashboardDemo"
import { AgentPanels } from "../dashboard/AgentPanels"
import { AttentionStrip } from "../dashboard/AttentionStrip"
import { CommandWelcome } from "../dashboard/CommandWelcome"
import { DashBoundary } from "../dashboard/DashBoundary"
import { ImpactStrip } from "../dashboard/ImpactStrip"
import { IntelligencePanels } from "../dashboard/IntelligencePanels"
import { LatestAiActions } from "../dashboard/LatestAiActions"
import { MarketSupplyPanels } from "../dashboard/MarketSupplyPanels"
import { OverviewSurplus } from "../dashboard/OverviewSurplus"
import { useTranslation } from "../i18n/LanguageProvider"
import "../dashboard.css"

export function DashboardPage() {
  const reduce = Boolean(useReducedMotion())
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info("[RipeRoute] dashboard mounted")
    }
  }, [])

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setActive((value) => (value + 1) % pulseKeys.length)
    }, 2400)
    return () => window.clearInterval(id)
  }, [reduce])

  return <DashboardBody active={active} />
}

function DashboardBody({ active }: { active: number }) {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-[1200px] space-y-4 px-4 py-4 sm:px-6 sm:py-5">
      <DashBoundary label="Welcome">
        <CommandWelcome />
      </DashBoundary>
      <DashBoundary label="Attention">
        <AttentionStrip />
      </DashBoundary>
      <DashBoundary label="Farm health">
        <IntelligencePanels />
      </DashBoundary>
      <DashBoundary label="Surplus">
        <OverviewSurplus />
      </DashBoundary>
      <DashBoundary label="Next action">
        <MarketSupplyPanels />
      </DashBoundary>
      <DashBoundary label="Latest AI Actions">
        <LatestAiActions />
      </DashBoundary>
      <DashBoundary label="Agents">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">{t("dash.navAgents")}</h2>
          <Link to="/ai-agents" className="dash-btn text-[12px]">
            {t("dash.viewDetails")}
          </Link>
        </div>
        <div className="mt-3">
          <AgentPanels active={active} compact />
        </div>
      </DashBoundary>
      <DashBoundary label="Impact">
        <ImpactStrip />
        <Link to="/impact" className="dash-btn mt-3 inline-flex text-[12px]">
          {t("dash.viewDetails")}
        </Link>
      </DashBoundary>
    </div>
  )
}
