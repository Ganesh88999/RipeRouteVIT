export type UserRole = "farmer" | "buyer"

export type FarmerProfile = {
  userId: string
  role: "farmer"
  onboardingCompleted: boolean
  timestamp: string
  displayName: string | null
  latitude: number
  longitude: number
  locationName: string
  city: string | null
  state: string | null
  country: string | null
  farmSizeAcres: number | null
  selectedCrop: string
  growthStage: string
  irrigation: string
  expectedHarvestKg: number | null
  preferredCrops: string[]
  mobileNumber: string
  soilEstimate?: string | null
  climateNote?: string | null
}

export type BuyerProfile = {
  userId: string
  role: "buyer"
  onboardingCompleted: boolean
  timestamp: string
  businessName: string
  buyerType: string
  latitude: number
  longitude: number
  locationName: string
  city: string | null
  state: string | null
  country: string | null
  preferredCrops: string[]
  typicalQuantityKg: number | null
  priceRangeLow: number | null
  priceRangeHigh: number | null
  mobileNumber: string
}

export type UserProfile = FarmerProfile | BuyerProfile

const PREFIX = "riperoute.userProfile."
const LEGACY_FARM = "riperoute.farmOnboarding."
const FARMS_KEY = "riperoute.farmDirectory"
const BUYERS_KEY = "riperoute.buyerDirectory"

function keyFor(userId: string) {
  return `${PREFIX}${userId}`
}

export function loadUserProfile(userId: string | null | undefined): UserProfile | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile
      if (parsed?.userId === userId && (parsed.role === "farmer" || parsed.role === "buyer")) {
        if (!("mobileNumber" in parsed) || parsed.mobileNumber == null) {
          ;(parsed as { mobileNumber: string }).mobileNumber = ""
        }
        return parsed
      }
    }

    // Do not auto-migrate legacy farm onboarding to farmer when the user
    // just chose Buyer before Google Sign-In (pending role in session).
    let pending: string | null = null
    try {
      pending = sessionStorage.getItem("riperoute.pendingRole")
    } catch {
      pending = null
    }
    if (pending === "buyer") {
      return null
    }

    const legacy = localStorage.getItem(`${LEGACY_FARM}${userId}`)
    if (legacy) {
      const old = JSON.parse(legacy) as {
        userId: string
        latitude: number
        longitude: number
        locationName: string
        city: string | null
        state: string | null
        country: string | null
        selectedCrop: string
        onboardingCompleted: boolean
        timestamp: string
        soilEstimate?: string | null
        climateNote?: string | null
      }
      if (old?.onboardingCompleted) {
        const migrated: FarmerProfile = {
          userId,
          role: "farmer",
          onboardingCompleted: true,
          timestamp: old.timestamp || new Date().toISOString(),
          displayName: null,
          latitude: old.latitude,
          longitude: old.longitude,
          locationName: old.locationName,
          city: old.city,
          state: old.state,
          country: old.country,
          farmSizeAcres: null,
          selectedCrop: old.selectedCrop || "Tomato",
          growthStage: "Unspecified",
          irrigation: "Unspecified",
          expectedHarvestKg: null,
          preferredCrops: old.selectedCrop ? [old.selectedCrop] : [],
          mobileNumber: "",
          soilEstimate: old.soilEstimate ?? null,
          climateNote: old.climateNote ?? null,
        }
        saveUserProfile(migrated)
        return migrated
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function saveUserProfile(profile: UserProfile) {
  localStorage.setItem(keyFor(profile.userId), JSON.stringify(profile))
  if (profile.role === "farmer" && profile.onboardingCompleted) {
    upsertFarmDirectory(profile)
  }
  if (profile.role === "buyer" && profile.onboardingCompleted) {
    upsertBuyerDirectory(profile)
  }
}

export function getUserRole(userId: string | null | undefined): UserRole | null {
  return loadUserProfile(userId)?.role ?? null
}

export function isRoleOnboardingComplete(userId: string | null | undefined) {
  const p = loadUserProfile(userId)
  return Boolean(p?.role && p.onboardingCompleted)
}

export function homePathForRole(role: UserRole | null | undefined) {
  if (role === "buyer") return "/buyer-dashboard"
  return "/dashboard"
}

export function roundCoordDisplay(value: number) {
  return Math.round(value * 100) / 100
}

/** Indian mobile: 10 digits, optional +91 / 0 prefix. */
export function normalizeMobileNumber(raw: string) {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1)
  return digits
}

export function isValidMobileNumber(raw: string) {
  const n = normalizeMobileNumber(raw)
  return /^[6-9]\d{9}$/.test(n)
}

export function getProfileMobile(userId: string | null | undefined) {
  const p = loadUserProfile(userId)
  if (!p) return ""
  return p.mobileNumber?.trim() || ""
}

export type FarmDirectoryEntry = {
  farmerId: string
  crop: string
  expectedHarvestKg: number | null
  latitude: number
  longitude: number
  locationName: string
  growthStage: string
  farmSizeAcres: number | null
  updatedAt: string
}

export type BuyerDirectoryEntry = {
  buyerId: string
  businessName: string
  buyerType: string
  latitude: number
  longitude: number
  locationName: string
  preferredCrops: string[]
  updatedAt: string
}

export function listFarms(): FarmDirectoryEntry[] {
  try {
    const raw = localStorage.getItem(FARMS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FarmDirectoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function listBuyers(): BuyerDirectoryEntry[] {
  try {
    const raw = localStorage.getItem(BUYERS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as BuyerDirectoryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function upsertFarmDirectory(profile: FarmerProfile) {
  const farms = listFarms().filter((f) => f.farmerId !== profile.userId)
  farms.push({
    farmerId: profile.userId,
    crop: profile.selectedCrop,
    expectedHarvestKg: profile.expectedHarvestKg,
    latitude: profile.latitude,
    longitude: profile.longitude,
    locationName: profile.locationName,
    growthStage: profile.growthStage,
    farmSizeAcres: profile.farmSizeAcres,
    updatedAt: new Date().toISOString(),
  })
  localStorage.setItem(FARMS_KEY, JSON.stringify(farms))
}

function upsertBuyerDirectory(profile: BuyerProfile) {
  const buyers = listBuyers().filter((b) => b.buyerId !== profile.userId)
  buyers.push({
    buyerId: profile.userId,
    businessName: profile.businessName,
    buyerType: profile.buyerType,
    latitude: profile.latitude,
    longitude: profile.longitude,
    locationName: profile.locationName,
    preferredCrops: profile.preferredCrops,
    updatedAt: new Date().toISOString(),
  })
  localStorage.setItem(BUYERS_KEY, JSON.stringify(buyers))
}

export function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const toRad = (d: number) => (d * Math.PI) / 180
  const R = 6371
  const dLat = toRad(b.latitude - a.latitude)
  const dLon = toRad(b.longitude - a.longitude)
  const lat1 = toRad(a.latitude)
  const lat2 = toRad(b.latitude)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)) * 10) / 10
}
