import {
  loadUserProfile,
  saveUserProfile,
  roundCoordDisplay,
  type FarmerProfile,
} from "./userProfile"

/** @deprecated Prefer userProfile — kept for compatibility with earlier onboarding. */
export type FarmOnboardingProfile = {
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

export function loadFarmProfile(userId: string | null | undefined): FarmOnboardingProfile | null {
  const p = loadUserProfile(userId)
  if (!p || p.role !== "farmer") return null
  return {
    userId: p.userId,
    latitude: p.latitude,
    longitude: p.longitude,
    locationName: p.locationName,
    city: p.city,
    state: p.state,
    country: p.country,
    selectedCrop: p.selectedCrop,
    onboardingCompleted: p.onboardingCompleted,
    timestamp: p.timestamp,
    soilEstimate: p.soilEstimate,
    climateNote: p.climateNote,
  }
}

export function saveFarmProfile(profile: FarmOnboardingProfile) {
  const existing = loadUserProfile(profile.userId)
  const next: FarmerProfile = {
    userId: profile.userId,
    role: "farmer",
    onboardingCompleted: profile.onboardingCompleted,
    timestamp: profile.timestamp,
    displayName: existing?.role === "farmer" ? existing.displayName : null,
    latitude: profile.latitude,
    longitude: profile.longitude,
    locationName: profile.locationName,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    farmSizeAcres: existing?.role === "farmer" ? existing.farmSizeAcres : null,
    selectedCrop: profile.selectedCrop,
    growthStage: existing?.role === "farmer" ? existing.growthStage : "Unspecified",
    irrigation: existing?.role === "farmer" ? existing.irrigation : "Unspecified",
    expectedHarvestKg: existing?.role === "farmer" ? existing.expectedHarvestKg : null,
    preferredCrops:
      existing?.role === "farmer" ? existing.preferredCrops : [profile.selectedCrop].filter(Boolean),
    mobileNumber: existing?.role === "farmer" ? existing.mobileNumber || "" : "",
    soilEstimate: profile.soilEstimate,
    climateNote: profile.climateNote,
  }
  saveUserProfile(next)
}

export function clearFarmProfile(userId: string) {
  localStorage.removeItem(`riperoute.userProfile.${userId}`)
  localStorage.removeItem(`riperoute.farmOnboarding.${userId}`)
}

export function isOnboardingComplete(userId: string | null | undefined) {
  const p = loadUserProfile(userId)
  return Boolean(p?.role && p.onboardingCompleted)
}

export { roundCoordDisplay }
