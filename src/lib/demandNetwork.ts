import { distanceKm, listBuyers, listFarms, getProfileMobile, type FarmerProfile } from "./userProfile"

export type RequestStatus = "matching" | "partially_filled" | "filled" | "closed"

/** Human-readable demand status for UI (OPEN ≈ finding farmers). */
export function requestStatusLabel(status: RequestStatus) {
  switch (status) {
    case "matching":
      return "OPEN"
    case "partially_filled":
      return "PARTIALLY_FULFILLED"
    case "filled":
      return "FULFILLED"
    case "closed":
      return "CLOSED"
    default:
      return String(status).toUpperCase()
  }
}
export type ResponseStatus =
  | "awaiting_buyer"
  | "accepted"
  | "rejected"
  | "counter"
  | "withdrawn"
export type LinkStatus = "active" | "completed" | "cancelled"

export type BuyerRequest = {
  id: string
  buyerId: string
  buyerName: string
  crop: string
  quantityKg: number
  pricePerKg: number
  neededBy: string
  locationName: string
  latitude: number
  longitude: number
  qualityNotes: string
  radiusKm: number | null
  notes: string
  status: RequestStatus
  filledKg: number
  createdAt: string
}

export type FarmerResponse = {
  id: string
  requestId: string
  farmerId: string
  farmerLabel: string
  offeredQuantityKg: number
  pricePerKg: number
  expectedHarvestDate: string
  status: ResponseStatus
  createdAt: string
  counterQuantityKg?: number | null
  counterPricePerKg?: number | null
  counterNeededBy?: string | null
}

export type FarmBuyerLink = {
  id: string
  requestId: string
  responseId: string
  buyerId: string
  farmerId: string
  buyerName: string
  farmerLabel: string
  crop: string
  agreedQuantityKg: number
  agreedPricePerKg: number
  expectedHarvestDate: string
  locationName: string
  distanceKm: number | null
  status: LinkStatus
  createdAt: string
  /** Only set on active links — not shown in public directories. */
  buyerMobile?: string
  farmerMobile?: string
  deliveryStatus?: "confirmed" | "preparing" | "dispatched" | "in_transit" | "delivered"
}

const REQ_KEY = "riperoute.buyerRequests"
const RES_KEY = "riperoute.farmerResponses"
const LINK_KEY = "riperoute.farmLinks"

function readList<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as T[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeList<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new Event("riperoute-demand-change"))
}

export function listRequests(): BuyerRequest[] {
  return readList<BuyerRequest>(REQ_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listResponses(): FarmerResponse[] {
  return readList<FarmerResponse>(RES_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listLinks(): FarmBuyerLink[] {
  return readList<FarmBuyerLink>(LINK_KEY).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getRequest(id: string) {
  return listRequests().find((r) => r.id === id) ?? null
}

export function getLink(id: string) {
  return listLinks().find((l) => l.id === id) ?? null
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function createBuyerRequest(
  input: Omit<BuyerRequest, "id" | "status" | "filledKg" | "createdAt">,
): BuyerRequest {
  const request: BuyerRequest = {
    ...input,
    id: uid("req"),
    status: "matching", // OPEN / finding farmers
    filledKg: 0,
    createdAt: new Date().toISOString(),
  }
  writeList(REQ_KEY, [request, ...listRequests()])
  return request
}

export function submitFarmerResponse(
  input: Omit<FarmerResponse, "id" | "status" | "createdAt">,
): FarmerResponse {
  const existing = listResponses().find(
    (r) => r.requestId === input.requestId && r.farmerId === input.farmerId && r.status === "awaiting_buyer",
  )
  if (existing) {
    const updated: FarmerResponse = {
      ...existing,
      ...input,
      status: "awaiting_buyer",
      createdAt: new Date().toISOString(),
    }
    writeList(
      RES_KEY,
      listResponses().map((r) => (r.id === existing.id ? updated : r)),
    )
    return updated
  }
  const response: FarmerResponse = {
    ...input,
    id: uid("res"),
    status: "awaiting_buyer",
    createdAt: new Date().toISOString(),
  }
  writeList(RES_KEY, [response, ...listResponses()])
  return response
}

export function rejectRequestByFarmer(requestId: string, farmerId: string) {
  const existing = listResponses().find((r) => r.requestId === requestId && r.farmerId === farmerId)
  if (existing) {
    writeList(
      RES_KEY,
      listResponses().map((r) =>
        r.id === existing.id ? { ...r, status: "withdrawn" as const } : r,
      ),
    )
    return
  }
  submitFarmerResponse({
    requestId,
    farmerId,
    farmerLabel: "Farm",
    offeredQuantityKg: 0,
    pricePerKg: 0,
    expectedHarvestDate: "",
  })
  const latest = listResponses().find((r) => r.requestId === requestId && r.farmerId === farmerId)
  if (latest) {
    writeList(
      RES_KEY,
      listResponses().map((r) => (r.id === latest.id ? { ...r, status: "withdrawn" as const } : r)),
    )
  }
}

export function acceptFarmerOffer(responseId: string): FarmBuyerLink | null {
  const response = listResponses().find((r) => r.id === responseId)
  if (!response || response.status !== "awaiting_buyer") return null
  const request = getRequest(response.requestId)
  if (!request) return null

  // Idempotent: already linked for this response
  const existingLink = listLinks().find((l) => l.responseId === responseId && l.status === "active")
  if (existingLink) return existingLink

  const farm = listFarms().find((f) => f.farmerId === response.farmerId)
  const buyer = listBuyers().find((b) => b.buyerId === request.buyerId)
  const dist =
    farm && buyer
      ? distanceKm(farm, buyer)
      : farm
        ? distanceKm(farm, { latitude: request.latitude, longitude: request.longitude })
        : null

  const link: FarmBuyerLink = {
    id: uid("link"),
    requestId: request.id,
    responseId: response.id,
    buyerId: request.buyerId,
    farmerId: response.farmerId,
    buyerName: request.buyerName,
    farmerLabel: response.farmerLabel,
    crop: request.crop,
    agreedQuantityKg: response.offeredQuantityKg,
    agreedPricePerKg: response.pricePerKg,
    expectedHarvestDate: response.expectedHarvestDate,
    locationName: request.locationName,
    distanceKm: dist,
    status: "active",
    createdAt: new Date().toISOString(),
    buyerMobile: getProfileMobile(request.buyerId),
    farmerMobile: getProfileMobile(response.farmerId),
    deliveryStatus: "confirmed",
  }

  writeList(
    RES_KEY,
    listResponses().map((r) => (r.id === responseId ? { ...r, status: "accepted" as const } : r)),
  )

  const filledKg = request.filledKg + response.offeredQuantityKg
  const status: RequestStatus =
    filledKg >= request.quantityKg ? "filled" : filledKg > 0 ? "partially_filled" : "matching"
  writeList(
    REQ_KEY,
    listRequests().map((r) => (r.id === request.id ? { ...r, filledKg, status } : r)),
  )
  writeList(LINK_KEY, [link, ...listLinks()])
  return link
}

export function rejectFarmerOffer(responseId: string) {
  writeList(
    RES_KEY,
    listResponses().map((r) =>
      r.id === responseId ? { ...r, status: "rejected" as const } : r,
    ),
  )
}

export function sendCounterOffer(
  responseId: string,
  counter: { quantityKg: number; pricePerKg: number; neededBy: string },
) {
  writeList(
    RES_KEY,
    listResponses().map((r) =>
      r.id === responseId
        ? {
            ...r,
            status: "counter" as const,
            counterQuantityKg: counter.quantityKg,
            counterPricePerKg: counter.pricePerKg,
            counterNeededBy: counter.neededBy,
          }
        : r,
    ),
  )
}

export function farmerAcceptCounter(responseId: string): FarmBuyerLink | null {
  const response = listResponses().find((r) => r.id === responseId)
  if (!response || response.status !== "counter") return null
  const qty = response.counterQuantityKg ?? response.offeredQuantityKg
  const price = response.counterPricePerKg ?? response.pricePerKg
  const harvest = response.counterNeededBy || response.expectedHarvestDate
  writeList(
    RES_KEY,
    listResponses().map((r) =>
      r.id === responseId
        ? {
            ...r,
            offeredQuantityKg: qty,
            pricePerKg: price,
            expectedHarvestDate: harvest,
            status: "awaiting_buyer" as const,
          }
        : r,
    ),
  )
  return acceptFarmerOffer(responseId)
}

export function committedKgForFarmer(farmerId: string) {
  return listLinks()
    .filter((l) => l.farmerId === farmerId && l.status === "active")
    .reduce((sum, l) => sum + l.agreedQuantityKg, 0)
}

export function remainingSurplusForFarmer(farmer: FarmerProfile) {
  const expected = farmer.expectedHarvestKg ?? 0
  const committed = committedKgForFarmer(farmer.userId)
  return Math.max(0, expected - committed)
}

export function updateLinkDeliveryStatus(
  linkId: string,
  deliveryStatus: NonNullable<FarmBuyerLink["deliveryStatus"]>,
) {
  writeList(
    LINK_KEY,
    listLinks().map((l) => (l.id === linkId ? { ...l, deliveryStatus } : l)),
  )
}

export function requestsForFarmer(farmer: FarmerProfile): Array<BuyerRequest & { matchScore: number; distance: number | null }> {
  return listRequests()
    .filter((r) => r.status === "matching" || r.status === "partially_filled")
    .filter((r) => r.filledKg < r.quantityKg)
    .filter((r) => r.crop.toLowerCase() === farmer.selectedCrop.toLowerCase() || farmer.preferredCrops.map((c) => c.toLowerCase()).includes(r.crop.toLowerCase()))
    .map((r) => {
      const distance = distanceKm(farmer, r)
      const remaining = r.quantityKg - r.filledKg
      let score = 50
      if (r.crop.toLowerCase() === farmer.selectedCrop.toLowerCase()) score += 25
      if (distance <= 40) score += 15
      else if (distance <= 80) score += 8
      const available = Math.max(0, (farmer.expectedHarvestKg ?? 0) - committedKgForFarmer(farmer.userId))
      if (available >= remaining) score += 15
      else if (available > 0) score += 8
      if (r.radiusKm != null && distance > r.radiusKm) score -= 20
      return { ...r, matchScore: Math.max(0, Math.min(99, score)), distance }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
}

export function subscribeDemand(listener: () => void) {
  window.addEventListener("riperoute-demand-change", listener)
  window.addEventListener("storage", listener)
  return () => {
    window.removeEventListener("riperoute-demand-change", listener)
    window.removeEventListener("storage", listener)
  }
}
