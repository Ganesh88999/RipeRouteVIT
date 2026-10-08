export type RescuePathway = "processing" | "redistribution" | "donation"

export type RescueRecommendation = {
  recommended: RescuePathway
  reason: string
  scores: Record<RescuePathway, number>
}

export type RescueContext = {
  quantityKg: number
  shelfLifeHours: number
  nearestKm: number
  hasVerifiedDonationOrg: boolean
}

export function rankRescueOptions(ctx: RescueContext): RescueRecommendation {
  const { quantityKg, shelfLifeHours, nearestKm, hasVerifiedDonationOrg } = ctx

  const redistribution =
    40 +
    (shelfLifeHours < 18 ? 25 : shelfLifeHours < 30 ? 15 : 5) +
    (nearestKm <= 30 ? 20 : nearestKm <= 50 ? 10 : 0) +
    (quantityKg <= 400 ? 10 : 5)

  const processing =
    35 +
    (shelfLifeHours >= 20 ? 20 : 8) +
    (quantityKg >= 150 ? 15 : 5) +
    (nearestKm > 40 ? 10 : 0)

  const donation =
    (hasVerifiedDonationOrg ? 45 : 10) +
    (shelfLifeHours >= 12 ? 10 : 0) +
    (quantityKg <= 250 ? 10 : 5)

  const scores = { processing, redistribution, donation }
  const recommended = (Object.entries(scores) as [RescuePathway, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0]

  const reasons: Record<RescuePathway, string> = {
    redistribution: `Fastest route with enough capacity for the remaining ${quantityKg} KG and current shelf-life window.`,
    processing: `Processing can extend usable life for about ${quantityKg} KG when buyer windows are tight.`,
    donation: hasVerifiedDonationOrg
      ? `A verified destination can absorb part of the ${quantityKg} KG within the remaining shelf-life window.`
      : `No verified donation partner is available for this location yet, so donation ranks lower.`,
  }

  return { recommended, reason: reasons[recommended], scores }
}

export const PROCESSING_OPTIONS = [
  {
    id: "juice",
    title: "Juice / puree",
    detail: "Convert soft surplus into juice or puree for short-hold processing.",
  },
  {
    id: "drying",
    title: "Drying",
    detail: "Reduce moisture to extend storage for suitable produce lots.",
  },
  {
    id: "preservation",
    title: "Preservation",
    detail: "Preserve within food-safety limits when immediate sale is unlikely.",
  },
  {
    id: "partner",
    title: "Local processing partner",
    detail: "Potential processing pathway — simulated until a live partner network is connected.",
  },
] as const

export const REDISTRIBUTION_OPTIONS = [
  {
    id: "community",
    title: "Nearby community",
    distanceKm: 12,
    window: "6–10 hours",
    shelfOk: true,
  },
  {
    id: "network",
    title: "Food rescue network",
    distanceKm: 24,
    window: "8–14 hours",
    shelfOk: true,
  },
  {
    id: "retail",
    title: "Retail redistribution",
    distanceKm: 31,
    window: "10–16 hours",
    shelfOk: true,
  },
  {
    id: "institutional",
    title: "Institutional destination",
    distanceKm: 28,
    window: "12–18 hours",
    shelfOk: true,
  },
] as const

/** Only show orgs that are verified. Empty = none available for location. */
export const VERIFIED_DONATION_ORGS: { id: string; name: string; kind: string }[] = []
