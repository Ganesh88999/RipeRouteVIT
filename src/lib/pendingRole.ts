import type { UserRole } from "./userProfile"
import { loadUserProfile, saveUserProfile } from "./userProfile"

const PENDING_KEY = "riperoute.pendingRole"

export function setPendingRole(role: UserRole) {
  sessionStorage.setItem(PENDING_KEY, role)
}

export function getPendingRole(): UserRole | null {
  try {
    const value = sessionStorage.getItem(PENDING_KEY)
    if (value === "farmer" || value === "buyer") return value
  } catch {
    /* ignore */
  }
  return null
}

export function clearPendingRole() {
  sessionStorage.removeItem(PENDING_KEY)
}

/**
 * Apply role chosen before Google Sign-In to the Firebase UID profile.
 *
 * - Same completed role + pending → keep profile, go home.
 * - Explicit pending that differs from a completed profile → switch role
 *   and require onboarding again (intentional role choice this session).
 * - No completed profile → pending wins.
 */
export function applyPendingRoleForUser(userId: string, displayName: string | null): UserRole | null {
  const pending = getPendingRole()
  const existing = loadUserProfile(userId)

  console.log("[RIPE AUTH] applyPendingRole", {
    uid: userId,
    pending,
    existingRole: existing?.role ?? null,
    onboardingCompleted: existing?.onboardingCompleted ?? false,
  })

  if (existing?.onboardingCompleted && existing.role) {
    if (!pending || pending === existing.role) {
      clearPendingRole()
      return existing.role
    }
    // Explicit opposite role chosen on landing before Google — switch.
    console.log("[RIPE AUTH] Switching role via pending selection", {
      from: existing.role,
      to: pending,
    })
  }

  if (!pending) {
    return existing?.role ?? null
  }

  if (pending === "farmer") {
    saveUserProfile({
      userId,
      role: "farmer",
      onboardingCompleted: false,
      timestamp: new Date().toISOString(),
      displayName,
      latitude: existing?.role === "farmer" ? existing.latitude : 0,
      longitude: existing?.role === "farmer" ? existing.longitude : 0,
      locationName: existing?.role === "farmer" ? existing.locationName : "",
      city: existing?.role === "farmer" ? existing.city : null,
      state: existing?.role === "farmer" ? existing.state : null,
      country: existing?.role === "farmer" ? existing.country : null,
      farmSizeAcres: existing?.role === "farmer" ? existing.farmSizeAcres : null,
      selectedCrop: existing?.role === "farmer" ? existing.selectedCrop : "Tomato",
      growthStage: existing?.role === "farmer" ? existing.growthStage : "Unspecified",
      irrigation: existing?.role === "farmer" ? existing.irrigation : "Unspecified",
      expectedHarvestKg: existing?.role === "farmer" ? existing.expectedHarvestKg : null,
      preferredCrops: existing?.role === "farmer" ? existing.preferredCrops : ["Tomato"],
      mobileNumber: existing?.role === "farmer" ? existing.mobileNumber || "" : "",
    })
  } else {
    saveUserProfile({
      userId,
      role: "buyer",
      onboardingCompleted: false,
      timestamp: new Date().toISOString(),
      businessName: displayName || "Buyer",
      buyerType: existing?.role === "buyer" ? existing.buyerType : "Retailer",
      latitude: existing?.role === "buyer" ? existing.latitude : 0,
      longitude: existing?.role === "buyer" ? existing.longitude : 0,
      locationName: existing?.role === "buyer" ? existing.locationName : "",
      city: existing?.role === "buyer" ? existing.city : null,
      state: existing?.role === "buyer" ? existing.state : null,
      country: existing?.role === "buyer" ? existing.country : null,
      preferredCrops: existing?.role === "buyer" ? existing.preferredCrops : ["Tomato"],
      typicalQuantityKg: existing?.role === "buyer" ? existing.typicalQuantityKg : null,
      priceRangeLow: existing?.role === "buyer" ? existing.priceRangeLow : null,
      priceRangeHigh: existing?.role === "buyer" ? existing.priceRangeHigh : null,
      mobileNumber: existing?.role === "buyer" ? existing.mobileNumber || "" : "",
    })
  }

  clearPendingRole()
  return pending
}
