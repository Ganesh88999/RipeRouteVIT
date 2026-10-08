export const navLinks = [
  { href: "#problem", key: "nav.problem" },
  { href: "#how-it-works", key: "nav.howItWorks" },
  { href: "#ai-network", key: "nav.aiNetwork" },
  { href: "#impact", key: "nav.impact" },
] as const

/** Demo harvest story — replace with backend values later. */
export const demoHarvest = {
  expectedKg: 1800,
  demandKg: 1300,
  surplusKg: 500,
  buyerMatchKg: 300,
  rescueKg: 200,
  shelfLifeHours: 16,
  source: "DEMO" as const,
}

export function formatKg(kg: number) {
  return `${kg.toLocaleString("en-IN")} KG`
}

export const donutSegments = [
  { id: "buyer", label: "Buyer Demand", percent: 72, color: "#1f6b4a" },
  { id: "rescue", label: "Food Rescue", percent: 18, color: "#c4841d" },
  { id: "processing", label: "Processing", percent: 10, color: "#8a8476" },
] as const

export const heroNetworkNodes = [
  { id: "farm", label: "Farm Intelligence", status: "Analyzing crop conditions..." },
  { id: "predict", label: "Predictive Engine", status: "Forecasting yield..." },
  { id: "surplus", label: "Surplus Detection", status: "Comparing demand..." },
  { id: "demand", label: "Demand Match", status: "Matching surplus..." },
  { id: "logistics", label: "Logistics", status: "Optimizing route..." },
  { id: "rescue", label: "Rescue", status: "Redirecting remainder..." },
] as const

export const lifecycleStages = [
  { id: "farm", title: "Farm", body: "Conditions, crop health and inputs are still disconnected from what happens after harvest." },
  { id: "harvest", title: "Harvest", body: "Volume arrives before demand and shelf life are fully understood." },
  { id: "market", title: "Market", body: "Buyers and farms often meet too late, after surplus is already sitting idle." },
  { id: "transport", title: "Transport", body: "Routes optimize distance, not perishability or remaining hours." },
  { id: "rescue", title: "Rescue", body: "Food rescue is treated as an afterthought instead of a planned destination." },
] as const

export const agentStory = [
  {
    id: "farm-intelligence",
    name: "Farm Intelligence Agent",
    status: "Analyzing crop conditions...",
    body: "Reads crop, weather, soil and irrigation signals into a shared operating picture before harvest is locked.",
    signals: ["Crop intelligence", "Weather", "Soil telemetry", "Irrigation"],
  },
  {
    id: "predictive-engine",
    name: "Predictive Engine Agent",
    status: "Forecasting yield...",
    body: "Estimates yield against demand and flags surplus and shelf-life risk while the produce still has time.",
    signals: ["Yield forecast", "Demand comparison", "Surplus prediction", "Shelf-life risk"],
  },
  {
    id: "demand-rescue",
    name: "Demand & Rescue Agent",
    status: "Matching surplus...",
    body: "Matches buyers first, then plans rescue and processing destinations for whatever remains.",
    signals: ["Buyer matching", "Rescue destination", "Value recovery"],
  },
  {
    id: "logistics-action",
    name: "Logistics & Action Agent",
    status: "Optimizing route...",
    body: "Selects movement around urgency, ETA and cold-chain risk — not distance alone.",
    signals: ["Route selection", "ETA", "Cold chain", "Action"],
  },
] as const

export const intelligenceChapters = [
  {
    id: "crop",
    kicker: "Field signals",
    title: "Crop intelligence",
    body: "Understand crop condition through images, location and simple farm inputs before stress becomes loss.",
    meta: "Agent 01 · Farm Intelligence",
  },
  {
    id: "weather",
    kicker: "Atmosphere",
    title: "Weather awareness",
    body: "Weather is treated as an operating constraint, not a daily note — informing irrigation, harvest timing and risk.",
    meta: "Agent 01 · Farm Intelligence",
  },
  {
    id: "soil",
    kicker: "Ground truth",
    title: "Soil & telemetry",
    body: "Soil moisture and field telemetry feed the same network that later decides where harvest should travel.",
    meta: "Agent 01 · Farm Intelligence",
  },
  {
    id: "water",
    kicker: "Water",
    title: "Precision irrigation",
    body: "Irrigation advice is coordinated with crop need and upcoming harvest — water saved is part of the same story as food rescued.",
    meta: "Agent 01 · Farm Intelligence",
  },
  {
    id: "stress",
    kicker: "Early warning",
    title: "Crop stress detection",
    body: "Stress and disease indicators are flagged early enough to change the yield and surplus forecast.",
    meta: "Agent 01 · Farm Intelligence",
  },
  {
    id: "yield",
    kicker: "Forecast",
    title: "Yield forecasting",
    body: "Expected harvest is estimated before it arrives, so demand matching can start while produce still has shelf life.",
    meta: "Agent 02 · Predictive Engine",
  },
] as const

export const agentCopyPrefix: Record<(typeof agentStory)[number]["id"], string> = {
  "farm-intelligence": "farm",
  "predictive-engine": "pred",
  "demand-rescue": "res",
  "logistics-action": "log",
}

export const rescueFlow = [
  { id: "harvest", label: "Harvest" },
  { id: "surplus", label: "Surplus detected" },
  { id: "buyer", label: "Buyer matched" },
  { id: "rescued", label: "Remaining surplus rescued" },
  { id: "logistics", label: "Logistics optimized" },
] as const

export const coordinationNodes = [
  { id: "farm", label: "Farm" },
  { id: "intel", label: "Farm Intelligence" },
  { id: "predict", label: "Predictive Engine" },
  { id: "demand", label: "Demand & Rescue" },
  { id: "logistics", label: "Logistics" },
  { id: "out", label: "Market / Rescue" },
] as const

/**
 * Editorial photography placeholders. Swap `src` later without changing layout.
 */
export const landingImages = {
  hero: {
    src: "https://images.unsplash.com/photo-1592928307389-36c577667bba?auto=format&fit=crop&w=2000&q=72",
    alt: "Rows of ripe tomatoes in a working greenhouse farm",
  },
  problem: {
    src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=72",
    alt: "Harvested crop rows under a wide agricultural sky",
  },
  intelligence: [
    {
      src: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1400&q=65",
      alt: "Close view of crop canopy in a working field",
    },
    {
      src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=65",
      alt: "Green crop field under changing weather",
    },
    {
      src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1800&q=65",
      alt: "Hands working with soil and young plants",
    },
    {
      src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=65",
      alt: "Irrigated crop rows across open farmland",
    },
    {
      src: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=1400&q=65",
      alt: "Crop detail used for stress and health reading",
    },
    {
      src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1400&q=65",
      alt: "Field canopy suggesting a yield forecast",
    },
  ],
  rescue: {
    src: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1800&q=72",
    alt: "Fresh produce arranged as a stand-in for market and rescue destinations",
  },
  cta: {
    src: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=72",
    alt: "A long agricultural horizon suggesting a harvest route",
  },
} as const

export const demoImpact = [
  {
    key: "expectedHarvest",
    numeric: true as const,
    target: demoHarvest.expectedKg,
    prefix: "",
    suffix: " KG",
    labelKey: "impact.harvest",
    label: "Expected harvest",
  },
  {
    key: "surplusIdentified",
    numeric: true as const,
    target: demoHarvest.surplusKg,
    prefix: "",
    suffix: " KG",
    labelKey: "impact.surplus",
    label: "Surplus identified",
  },
  {
    key: "buyerMatched",
    numeric: true as const,
    target: demoHarvest.buyerMatchKg,
    prefix: "",
    suffix: " KG",
    labelKey: "impact.buyer",
    label: "Buyer matched",
  },
  {
    key: "rescuePlanned",
    numeric: true as const,
    target: demoHarvest.rescueKg,
    prefix: "",
    suffix: " KG",
    labelKey: "impact.rescue",
    label: "Rescue planned",
  },
]

export const sdgs = [
  { code: "SDG 2", name: "Zero Hunger" },
  { code: "SDG 12", name: "Responsible Consumption & Production" },
] as const
