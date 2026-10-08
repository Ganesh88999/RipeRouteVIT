export type Suitability = "Suitable" | "Moderate" | "Limited"

export type CropSuggestion = {
  crop: string
  suitability: Suitability
  reason: string
  season: string
  kind: "MODELLED"
}

export type FarmIntelligence = {
  soilType: string
  soilConfidence: "Low" | "Medium" | "High"
  soilKind: "MODELLED"
  climate: string
  climateKind: "MODELLED"
  irrigationNote: string
  crops: CropSuggestion[]
  disclaimer: string
}

/** Regional heuristics only — clearly labelled as modelled / preliminary. */
const REGIONS: {
  match: RegExp
  soil: string
  climate: string
  irrigation: string
  crops: Omit<CropSuggestion, "kind">[]
}[] = [
  {
    match: /tamil\s*nadu|chennai|coimbatore|madurai|trichy|salem/i,
    soil: "Red loamy / alluvial (typical of many TN districts)",
    climate: "Tropical wet–dry; warm year-round with distinct monsoon windows",
    irrigation: "Plan around NE/SW monsoon; drip helps for vegetables in dry spells",
    crops: [
      { crop: "Tomato", suitability: "Suitable", reason: "Widely grown under irrigation in warm plains", season: "Year-round with peak winter harvest" },
      { crop: "Banana", suitability: "Suitable", reason: "Favours warm humid belts with reliable water", season: "Perennial with staggered harvest" },
      { crop: "Groundnut", suitability: "Moderate", reason: "Fits lighter soils; moisture timing critical", season: "Kharif / early rabi" },
      { crop: "Onion", suitability: "Moderate", reason: "Needs well-drained beds and careful irrigation", season: "Rabi / late kharif" },
      { crop: "Rice", suitability: "Moderate", reason: "Better where canal/tank irrigation is reliable", season: "Kuruvai / samba windows" },
    ],
  },
  {
    match: /karnataka|bengaluru|mysuru|hubli|belagavi/i,
    soil: "Red sandy loam / lateritic in parts",
    climate: "Tropical to semi-arid inland; cooler highland pockets",
    irrigation: "Mulching and scheduled drip useful in dry months",
    crops: [
      { crop: "Tomato", suitability: "Suitable", reason: "Strong horticulture belts with market access", season: "Multiple cycles with irrigation" },
      { crop: "Onion", suitability: "Suitable", reason: "Common in northern / central dry zones", season: "Rabi focus" },
      { crop: "Potato", suitability: "Moderate", reason: "Better in cooler highland pockets", season: "Winter / early spring" },
      { crop: "Groundnut", suitability: "Suitable", reason: "Fits rainfed light soils when monsoon is timely", season: "Kharif" },
      { crop: "Rice", suitability: "Moderate", reason: "Depends on command-area water", season: "Kharif" },
    ],
  },
  {
    match: /maharashtra|pune|nashik|nagpur|mumbai/i,
    soil: "Black cotton (vertisol) / mixed alluvial",
    climate: "Semi-arid to tropical monsoon",
    irrigation: "Protective irrigation critical outside monsoon",
    crops: [
      { crop: "Onion", suitability: "Suitable", reason: "Major production belts with storage markets", season: "Rabi / late kharif" },
      { crop: "Tomato", suitability: "Suitable", reason: "Strong peri-urban demand corridors", season: "Multiple irrigated cycles" },
      { crop: "Groundnut", suitability: "Moderate", reason: "Fits light soils in rainfed tracts", season: "Kharif" },
      { crop: "Banana", suitability: "Moderate", reason: "Needs reliable water and heat", season: "Perennial" },
      { crop: "Potato", suitability: "Limited", reason: "Cooler pockets only", season: "Winter" },
    ],
  },
  {
    match: /punjab|haryana|delhi|uttar\s*pradesh|bihar/i,
    soil: "Alluvial (Indo-Gangetic plains)",
    climate: "Subtropical; hot summers, cool winters, monsoon rains",
    irrigation: "Canal / tube-well systems common; watch waterlogging in low fields",
    crops: [
      { crop: "Rice", suitability: "Suitable", reason: "Fits irrigated kharif systems in plains", season: "Kharif" },
      { crop: "Potato", suitability: "Suitable", reason: "Strong cool-season vegetable belt", season: "Rabi" },
      { crop: "Onion", suitability: "Moderate", reason: "Needs drainage and careful curing", season: "Rabi" },
      { crop: "Tomato", suitability: "Moderate", reason: "Works with protected / irrigated cultivation", season: "Winter / spring" },
      { crop: "Banana", suitability: "Limited", reason: "Heat and water needs limit rainfed areas", season: "Perennial where irrigated" },
    ],
  },
  {
    match: /india|asia/i,
    soil: "Mixed tropical soils (region-dependent)",
    climate: "Monsoon-influenced tropical / subtropical climate",
    irrigation: "Align irrigation with local rainfall and crop stage; confirm with local extension",
    crops: [
      { crop: "Tomato", suitability: "Suitable", reason: "Broad adaptability under irrigation", season: "Local season windows vary" },
      { crop: "Onion", suitability: "Moderate", reason: "Needs well-drained soils and curing space", season: "Cooler / dry season" },
      { crop: "Rice", suitability: "Moderate", reason: "Depends on water availability", season: "Kharif where irrigated" },
      { crop: "Banana", suitability: "Moderate", reason: "Warm humid zones with water", season: "Perennial" },
      { crop: "Potato", suitability: "Moderate", reason: "Cooler seasons or elevations", season: "Rabi / winter" },
    ],
  },
]

export function buildFarmIntelligence(input: {
  state?: string | null
  country?: string | null
  locationName?: string | null
}): FarmIntelligence {
  const haystack = [input.locationName, input.state, input.country].filter(Boolean).join(", ")
  const region =
    REGIONS.find((item) => item.match.test(haystack)) ?? REGIONS[REGIONS.length - 1]

  return {
    soilType: region.soil,
    soilConfidence: "Medium",
    soilKind: "MODELLED",
    climate: region.climate,
    climateKind: "MODELLED",
    irrigationNote: region.irrigation,
    crops: region.crops.slice(0, 5).map((crop) => ({ ...crop, kind: "MODELLED" as const })),
    disclaimer:
      "Preliminary AI recommendations based on regional patterns. Exact soil chemistry requires a soil test. Confirm final crop choice with a local agronomist.",
  }
}

export const CROP_OPTIONS = ["Tomato", "Onion", "Potato", "Rice", "Banana", "Other"] as const
