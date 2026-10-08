import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bot,
  ChartColumn,
  Droplets,
  Handshake,
  HeartHandshake,
  HeartPulse,
  HelpCircle,
  Landmark,
  LayoutDashboard,
  Leaf,
  Link2,
  PackageSearch,
  Settings,
  ShieldAlert,
  Sprout,
  Store,
  Users,
} from "lucide-react"

export type DashNavItem = {
  id: string
  key: string
  to: string
  icon: LucideIcon
}

export type DashNavGroup = {
  labelKey: string
  items: DashNavItem[]
}

export const farmerNav: DashNavGroup[] = [
  {
    labelKey: "dash.navGroupOverview",
    items: [{ id: "overview", key: "dash.navDashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "dash.navGroupMyFarm",
    items: [
      { id: "advisor", key: "dash.navAdvisor", to: "/farm-advisor", icon: Sprout },
      { id: "crop-health", key: "dash.navHealth", to: "/crop-health", icon: HeartPulse },
      { id: "irrigation", key: "dash.navIrrigate", to: "/irrigation", icon: Droplets },
    ],
  },
  {
    labelKey: "dash.navGroupPlan",
    items: [
      { id: "planner", key: "dash.navPlanner", to: "/production-planner", icon: ChartColumn },
      { id: "yield", key: "dash.navYield", to: "/yield-surplus", icon: ChartColumn },
    ],
  },
  {
    labelKey: "dash.navGroupBuy",
    items: [
      { id: "buyer-requests", key: "dash.navBuyerRequests", to: "/buyer-requests", icon: Handshake },
      { id: "buyer-links", key: "dash.navBuyerLinks", to: "/buyer-links", icon: Link2 },
    ],
  },
  {
    labelKey: "dash.navGroupSupply",
    items: [
      { id: "market", key: "dash.navDemandOpp", to: "/market-demand", icon: PackageSearch },
      { id: "rescue", key: "dash.navRescue", to: "/food-rescue", icon: Leaf },
    ],
  },
  {
    labelKey: "dash.navGroupSupport",
    items: [
      { id: "support", key: "dash.navSupport", to: "/farmer-support", icon: Users },
      { id: "schemes", key: "dash.navSchemes", to: "/government-schemes", icon: Landmark },
      { id: "support-project", key: "dash.navSupportProject", to: "/support-project", icon: HeartHandshake },
    ],
  },
  {
    labelKey: "dash.navGroupAi",
    items: [
      { id: "agents", key: "dash.navAgents", to: "/ai-agents", icon: Bot },
      { id: "stream", key: "dash.navStream", to: "/ai-decisions", icon: ShieldAlert },
    ],
  },
  {
    labelKey: "dash.navGroupAnalytics",
    items: [{ id: "impact-ops", key: "dash.navImpactOps", to: "/impact", icon: Activity }],
  },
  {
    labelKey: "dash.navGroupSystem",
    items: [
      { id: "settings", key: "dash.settings", to: "/settings", icon: Settings },
      { id: "help", key: "dash.help", to: "/help", icon: HelpCircle },
    ],
  },
]

export const buyerNav: DashNavGroup[] = [
  {
    labelKey: "dash.navGroupOverview",
    items: [{ id: "buyer-home", key: "dash.navBuyerHome", to: "/buyer-dashboard", icon: LayoutDashboard }],
  },
  {
    labelKey: "dash.navGroupBuy",
    items: [
      { id: "create", key: "dash.navCreateDemand", to: "/buyer-dashboard", icon: Store },
      { id: "farm-links", key: "dash.navFarmLinks", to: "/buyer-links", icon: Link2 },
      { id: "opportunities", key: "dash.navDemandOpp", to: "/market-demand", icon: PackageSearch },
    ],
  },
  {
    labelKey: "dash.navGroupSupport",
    items: [
      { id: "support-project", key: "dash.navSupportProject", to: "/support-project", icon: HeartHandshake },
    ],
  },
  {
    labelKey: "dash.navGroupSystem",
    items: [
      { id: "settings", key: "dash.settings", to: "/settings", icon: Settings },
      { id: "help", key: "dash.help", to: "/help", icon: HelpCircle },
    ],
  },
]

/** @deprecated use farmerNav / buyerNav */
export const dashNav = farmerNav
