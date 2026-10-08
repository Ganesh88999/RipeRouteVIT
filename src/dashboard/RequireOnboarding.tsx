import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import { applyPendingRoleForUser } from "../lib/pendingRole"
import { homePathForRole, isValidMobileNumber, loadUserProfile, type UserRole } from "../lib/userProfile"

function resolveProfile(userId: string, displayName: string | null) {
  applyPendingRoleForUser(userId, displayName)
  return loadUserProfile(userId)
}

/** Ensures onboarding completed for the authenticated role. */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />

  const profile = resolveProfile(user.uid, user.displayName)

  console.log("[RIPE AUTH] RequireOnboarding", {
    uid: user.uid,
    role: profile?.role ?? null,
    onboardingCompleted: profile?.onboardingCompleted ?? false,
  })

  if (!profile?.role) {
    return <Navigate to="/onboarding/role" replace />
  }

  if (!profile.onboardingCompleted) {
    return (
      <Navigate
        to={profile.role === "buyer" ? "/buyer-onboarding" : "/farmer-onboarding"}
        replace
      />
    )
  }

  if (!isValidMobileNumber(profile.mobileNumber || "")) {
    return (
      <Navigate
        to={profile.role === "buyer" ? "/buyer-onboarding" : "/farmer-onboarding?update=1"}
        replace
      />
    )
  }

  return children
}

/** Enforces farmer vs buyer product surfaces. */
export function RequireRole({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/" replace />

  const profile = resolveProfile(user.uid, user.displayName)

  console.log("[RIPE AUTH] RequireRole", {
    uid: user.uid,
    required: role,
    role: profile?.role ?? null,
    path: location.pathname,
  })

  if (!profile?.role) {
    return <Navigate to="/onboarding/role" replace />
  }

  if (!profile.onboardingCompleted) {
    return (
      <Navigate
        to={profile.role === "buyer" ? "/buyer-onboarding" : "/farmer-onboarding"}
        replace
      />
    )
  }

  if (!isValidMobileNumber(profile.mobileNumber || "")) {
    return (
      <Navigate
        to={profile.role === "buyer" ? "/buyer-onboarding" : "/farmer-onboarding?update=1"}
        replace
      />
    )
  }

  if (profile.role !== role) {
    return <Navigate to={homePathForRole(profile.role)} replace state={{ from: location.pathname }} />
  }

  return children
}
