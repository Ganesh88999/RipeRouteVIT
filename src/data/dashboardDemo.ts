import { demoHarvest, donutSegments } from "./landingPageData"

export const opsHarvest = demoHarvest
export const opsDonut = donutSegments

export const farmProfile = {
  farm: "Demo Tomato Farm",
  region: "Tamil Nadu, India",
  crop: "Tomato",
  acres: 2,
  stage: "Flowering / Fruiting",
  confidence: 94,
} as const

export const farmTelemetry = {
  crop: "tomato",
  area: "2 acres",
  health: 92,
  weatherC: 28,
  humidity: 72,
  soil: 38,
  soilTemp: 24,
  rain: 72,
  irrigation: "delay",
  stress: "low",
  disease: 12,
  waterSavedL: 120,
  electricityKwh: 4.2,
} as const

export const logistics = {
  origin: "Demo Tomato Farm",
  destination: "Local Retail Network",
  distanceKm: 24,
  eta: "1h 15m",
  shelf: "16h",
  cold: "required",
  risk: "low",
} as const

export const marketDemo = {
  demandKg: 300,
  trendPct: 12,
  priceLow: 18,
  priceHigh: 24,
} as const

export const buyers = [
  { id: "retail", name: "Local Retail Network", kg: 300, km: 24, demand: "High", match: 96, type: "retail" },
  { id: "processor", name: "Regional Processor", kg: 100, km: 31, demand: "High", match: 89, type: "processor" },
  { id: "restaurant", name: "Restaurant cluster", kg: 80, km: 18, demand: "Medium", match: 84, type: "restaurant" },
  { id: "wholesale", name: "Wholesaler", kg: 200, km: 42, demand: "Low", match: 51, type: "wholesale" },
] as const

export const impactDemo = {
  foodRescuedKg: 200,
  waterSavedL: 120,
  valueInr: 4800,
  co2eKg: 48,
  fertilizerPct: 6,
  yieldPct: 4,
} as const

export const perishabilityLots = [
  { id: "t1", crop: "Tomato", kg: 500, hours: 16, risk: "medium" },
  { id: "t2", crop: "Tomato", kg: 300, hours: 11, risk: "high" },
] as const

export const analyticsSeries = {
  harvest: [1200, 1400, 1550, 1680, 1800],
  demand: [900, 1050, 1180, 1240, 1300],
  surplus: [300, 350, 370, 440, 500],
  water: [90, 110, 100, 130, 120],
  health: [78, 82, 88, 90, 92],
  rescued: [80, 110, 140, 170, 200],
  value: [1600, 2400, 3100, 3900, 4800],
} as const

export const streamSeed = [
  { id: "e1", time: "10:42:03", agentKey: "dash.farmAgent", bodyKey: "dash.e1" },
  { id: "e2", time: "10:42:05", agentKey: "dash.predAgent", bodyKey: "dash.e2" },
  { id: "e3", time: "10:42:07", agentKey: "dash.predAgent", bodyKey: "dash.e2b" },
  { id: "e4", time: "10:42:10", agentKey: "dash.demandAgent", bodyKey: "dash.e3" },
  { id: "e5", time: "10:42:13", agentKey: "dash.demandAgent", bodyKey: "dash.e4" },
  { id: "e6", time: "10:42:16", agentKey: "dash.logAgent", bodyKey: "dash.e5" },
] as const

export const coordNodes = [
  { id: "farm", labelKey: "dash.nodeFarm" },
  { id: "intel", labelKey: "dash.nodeIntel" },
  { id: "pred", labelKey: "dash.nodePred" },
  { id: "demand", labelKey: "dash.nodeDemand" },
  { id: "log", labelKey: "dash.nodeLog" },
  { id: "out", labelKey: "dash.nodeOut" },
] as const

export const schemeDemo = [
  {
    id: "s1",
    title: "Input support (demo)",
    purpose: "Crop inputs",
    docs: ["Land record", "ID proof", "Bank passbook"],
    steps: ["Review eligibility locally", "Collect documents", "Apply through the official portal"],
  },
  {
    id: "s2",
    title: "Irrigation assistance (demo)",
    purpose: "Water efficiency",
    docs: ["Farm size proof", "Crop declaration"],
    steps: ["Confirm farm area", "Check local scheme window", "Submit through authorised channel"],
  },
] as const

export const supportDemo = [
  { id: "r1", category: "financial", label: "Seasonal credit desk" },
  { id: "r2", category: "experts", label: "Agronomy helpline" },
  { id: "r3", category: "workers", label: "Harvest labour pool" },
  { id: "r4", category: "inputs", label: "Seed and fertiliser coop" },
  { id: "r5", category: "ngo", label: "Food rescue network" },
  { id: "r6", category: "network", label: "Farmer producer group" },
] as const

export const pulseKeys = [
  "dash.pulseFarm",
  "dash.pulsePred",
  "dash.pulseDemand",
  "dash.pulseLog",
  "dash.pulseImpact",
] as const
