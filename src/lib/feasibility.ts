import type { BuyerRequest } from "./demandNetwork"
import { committedKgForFarmer } from "./demandNetwork"
import type { FarmerProfile } from "./userProfile"

export type FeasibilityKind = "full" | "partial" | "not_feasible"

export type FeasibilityResult = {
  kind: FeasibilityKind
  requestedKg: number
  expectedAvailableKg: number
  committedKg: number
  feasibleKg: number
  shortfallKg: number
  bufferKg: number
  recommendation: string
  profitability: {
    estimable: boolean
    grossRevenue: number | null
    estimatedProductionCost: number | null
    estimatedTransportCost: number | null
    estimatedMargin: number | null
    note: string
  }
}

export function assessFeasibility(
  farmer: FarmerProfile,
  request: BuyerRequest,
): FeasibilityResult {
  const remainingNeed = Math.max(0, request.quantityKg - request.filledKg)
  const committedKg = committedKgForFarmer(farmer.userId)
  const expected = farmer.expectedHarvestKg
  // If harvest estimate is missing, treat remaining demand as offerable (manual judgment).
  const expectedAvailableKg =
    expected == null ? remainingNeed : Math.max(0, expected - committedKg)
  const feasibleKg = Math.min(remainingNeed, expectedAvailableKg)

  let kind: FeasibilityKind
  if (remainingNeed <= 0) {
    kind = "not_feasible"
  } else if (expected == null) {
    kind = "partial"
  } else if (expectedAvailableKg >= remainingNeed) {
    kind = "full"
  } else if (expectedAvailableKg > 0) {
    kind = "partial"
  } else {
    kind = "not_feasible"
  }

  const shortfallKg = Math.max(0, remainingNeed - feasibleKg)
  const bufferKg = Math.max(0, expectedAvailableKg - remainingNeed)

  const recommendation =
    kind === "full"
      ? `Accept this order. Your expected production covers the request with a ${bufferKg} KG buffer.`
      : kind === "partial"
        ? expected == null
          ? "Harvest estimate not set — enter how much you can supply and submit an offer."
          : "Accept a partial order if the buyer agrees."
        : "Consider the remaining demand as an opportunity for another farmer."

  const grossRevenue = feasibleKg > 0 ? Math.round(feasibleKg * request.pricePerKg) : null
  const hasCostBasis = farmer.farmSizeAcres != null && feasibleKg > 0
  const estimatedProductionCost = hasCostBasis ? Math.round(feasibleKg * request.pricePerKg * 0.55) : null
  const estimatedTransportCost = hasCostBasis ? Math.round(feasibleKg * 1.2) : null
  const estimatedMargin =
    grossRevenue != null && estimatedProductionCost != null && estimatedTransportCost != null
      ? grossRevenue - estimatedProductionCost - estimatedTransportCost
      : null

  return {
    kind,
    requestedKg: remainingNeed,
    expectedAvailableKg,
    committedKg,
    feasibleKg,
    shortfallKg,
    bufferKg,
    recommendation,
    profitability: {
      estimable: estimatedMargin != null,
      grossRevenue,
      estimatedProductionCost,
      estimatedTransportCost,
      estimatedMargin,
      note:
        estimatedMargin != null
          ? "ESTIMATED from price × quantity and simple cost heuristics. Not actual farm accounts."
          : "Profitability cannot be reliably estimated yet.",
    },
  }
}

/** Modelled production planner suggestion — clearly labelled. */
export function planProduction(input: {
  farmSizeAcres: number
  crop: string
  demandMidKg: number
  demandLowKg: number
  demandHighKg: number
}) {
  const yieldPerAcre =
    input.crop.toLowerCase() === "tomato"
      ? 7000
      : input.crop.toLowerCase() === "onion"
        ? 5000
        : input.crop.toLowerCase() === "rice"
          ? 2500
          : 4000
  const safeTarget = Math.round(input.demandMidKg * 1.05)
  const recommendedArea = Math.min(
    input.farmSizeAcres,
    Math.round((safeTarget / yieldPerAcre) * 100) / 100,
  )
  const expectedYield = Math.round(recommendedArea * yieldPerAcre)
  const projectedSurplus = Math.max(0, expectedYield - input.demandMidKg)
  return {
    recommendedCrop: input.crop,
    recommendedArea,
    expectedYield,
    demandLow: input.demandLowKg,
    demandHigh: input.demandHighKg,
    demandMid: input.demandMidKg,
    projectedSurplus,
    risk: projectedSurplus > expectedYield * 0.25 ? "HIGH" : projectedSurplus > expectedYield * 0.12 ? "MEDIUM" : "LOW",
    confidence: 78,
    kind: "MODELLED" as const,
  }
}
