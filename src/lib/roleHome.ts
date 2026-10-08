import type { User } from "firebase/auth"
import { applyPendingRoleForUser, getPendingRole } from "./pendingRole"
import { isValidMobileNumber, loadUserProfile, type UserRole } from "./userProfile"

export type RoleHomeResult = {
  path: string
  role: UserRole | null
  onboardingCompleted: boolean
  reason: string
}

/**
 * Central post-login destination. Role comes from the Firebase-uid profile
 * (after applying any pending role chosen before Google Sign-In).
 */
export function getRoleBasedHome(user: User | null | undefined): RoleHomeResult {
  if (!user) {
    return { path: "/", role: null, onboardingCompleted: false, reason: "unauthenticated" }
  }

  const pending = getPendingRole()
  const role = applyPendingRoleForUser(user.uid, user.displayName)
  const profile = loadUserProfile(user.uid)

  console.log("[RIPE AUTH]", {
    uid: user.uid,
    pendingRole: pending,
    role: profile?.role ?? role,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
  })

  if (!profile?.role) {
    return {
      path: "/onboarding/role",
      role: null,
      onboardingCompleted: false,
      reason: "missing_role",
    }
  }

  if (!profile.onboardingCompleted) {
    return {
      path: profile.role === "buyer" ? "/buyer-onboarding" : "/farmer-onboarding",
      role: profile.role,
      onboardingCompleted: false,
      reason: "onboarding_required",
    }
  }

  if (!isValidMobileNumber(profile.mobileNumber || "")) {
    return {
      path: profile.role === "buyer" ? "/buyer-onboarding" : "/farmer-onboarding?update=1",
      role: profile.role,
      onboardingCompleted: false,
      reason: "mobile_required",
    }
  }

  if (profile.role === "buyer") {
    return {
      path: "/buyer-dashboard",
      role: "buyer",
      onboardingCompleted: true,
      reason: "buyer_home",
    }
  }

  return {
    path: "/dashboard",
    role: "farmer",
    onboardingCompleted: true,
    reason: "farmer_home",
  }
}

export function homePathForUser(user: User | null | undefined) {
  return getRoleBasedHome(user).path
}
