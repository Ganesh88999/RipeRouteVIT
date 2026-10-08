import {
  ClipboardList,
  Handshake,
  HelpCircle,
  LayoutDashboard,
  Link2,
  PackageCheck,
  PlusCircle,
  Settings,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react"

export type BuyerNavItem = {
  id: string
  labelKey: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export type BuyerNavGroup = {
  labelKey: string
  items: BuyerNavItem[]
}

export const buyerNavGroups: BuyerNavGroup[] = [
  {
    labelKey: "dash.buyerNavOverview",
    items: [
      { id: "home", labelKey: "dash.buyerNavDashboard", to: "/buyer-dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    labelKey: "dash.buyerNavDemand",
    items: [
      { id: "create", labelKey: "dash.buyerNavCreateDemand", to: "/buyer-dashboard/create-demand", icon: PlusCircle },
      { id: "requests", labelKey: "dash.buyerNavMyDemands", to: "/buyer-dashboard/requests", icon: ClipboardList },
      { id: "responses", labelKey: "dash.buyerNavResponses", to: "/buyer-dashboard/responses", icon: Handshake },
    ],
  },
  {
    labelKey: "dash.buyerNavSupply",
    items: [
      { id: "farmers", labelKey: "dash.buyerNavNearby", to: "/buyer-dashboard/farmers", icon: Users },
      { id: "matches", labelKey: "dash.buyerNavMatches", to: "/buyer-dashboard/farmers", icon: Store },
      { id: "links", labelKey: "dash.buyerNavLinks", to: "/buyer-dashboard/farm-links", icon: Link2 },
    ],
  },
  {
    labelKey: "dash.buyerNavOrders",
    items: [
      { id: "active", labelKey: "dash.buyerNavActiveOrders", to: "/buyer-dashboard/orders", icon: PackageCheck },
      { id: "done", labelKey: "dash.buyerNavCompleted", to: "/buyer-dashboard/orders?tab=completed", icon: PackageCheck },
    ],
  },
  {
    labelKey: "dash.buyerNavLogistics",
    items: [{ id: "deliveries", labelKey: "dash.buyerNavDeliveries", to: "/buyer-dashboard/deliveries", icon: Truck }],
  },
  {
    labelKey: "dash.buyerNavSupportGroup",
    items: [{ id: "support", labelKey: "dash.buyerNavSupport", to: "/buyer-dashboard/support", icon: HelpCircle }],
  },
  {
    labelKey: "dash.buyerNavSettings",
    items: [{ id: "settings", labelKey: "dash.buyerNavSettings", to: "/settings", icon: Settings }],
  },
]
