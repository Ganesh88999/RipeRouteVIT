import { motion, useReducedMotion } from "framer-motion"
import { Sprout, Store } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import {
  homePathForRole,
  loadUserProfile,
  saveUserProfile,
  type UserRole,
} from "../lib/userProfile"
import { useTranslation } from "../i18n/LanguageProvider"
import { useDemandNetwork } from "./FarmProfileContext"

/**
 * Fallback only: used when an authenticated user has no saved role
 * (e.g. cancelled mid-flow). Normal path selects role before Google auth.
 */
export function RoleSelectPage() {
  const { user } = useAuth()
  const { saveProfile, refreshProfile } = useDemandNetwork()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { t } = useTranslation()

  if (!user) return <Navigate to="/" replace />

  const existing = loadUserProfile(user.uid)
  if (existing?.role && existing.onboardingCompleted) {
    return <Navigate to={homePathForRole(existing.role)} replace />
  }
  if (existing?.role && !existing.onboardingCompleted) {
    return <Navigate to={existing.role === "buyer" ? "/onboarding/buyer" : "/onboarding/farmer"} replace />
  }

  function choose(role: UserRole) {
    if (!user) return
    const stub =
      role === "farmer"
        ? {
            userId: user.uid,
            role: "farmer" as const,
            onboardingCompleted: false,
            timestamp: new Date().toISOString(),
            displayName: user.displayName,
            latitude: 0,
            longitude: 0,
            locationName: "",
            city: null,
            state: null,
            country: null,
            farmSizeAcres: null,
            selectedCrop: "Tomato",
            growthStage: "Unspecified",
            irrigation: "Unspecified",
            expectedHarvestKg: null,
            preferredCrops: ["Tomato"],
            mobileNumber: "",
          }
        : {
            userId: user.uid,
            role: "buyer" as const,
            onboardingCompleted: false,
            timestamp: new Date().toISOString(),
            businessName: user.displayName || "Buyer",
            buyerType: "Retailer",
            latitude: 0,
            longitude: 0,
            locationName: "",
            city: null,
            state: null,
            country: null,
            preferredCrops: ["Tomato"],
            typicalQuantityKg: null,
            priceRangeLow: null,
            priceRangeHigh: null,
            mobileNumber: "",
          }
    saveUserProfile(stub)
    saveProfile(stub)
    refreshProfile()
    navigate(role === "buyer" ? "/onboarding/buyer" : "/onboarding/farmer", { replace: true })
  }

  return (
    <div className="command-center min-h-svh bg-canvas px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] tracking-[0.2em] uppercase text-leaf">RipeRoute</p>
        <h1 className="font-display mt-2 text-3xl">{t("dash.roleHowTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {t("dash.roleFarmer")} / {t("dash.roleBuyer")}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <motion.button
            type="button"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card dash-card-hover p-6 text-left"
            onClick={() => choose("farmer")}
          >
            <Sprout className="h-8 w-8 text-forest" />
            <p className="mt-4 text-lg font-semibold">🌱 {t("dash.roleFarmer")}</p>
            <p className="mt-2 text-sm text-ink-muted">{t("dash.roleFarmerBody")}</p>
          </motion.button>
          <motion.button
            type="button"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="dash-card dash-card-hover p-6 text-left"
            onClick={() => choose("buyer")}
          >
            <Store className="h-8 w-8 text-forest" />
            <p className="mt-4 text-lg font-semibold">🏪 {t("dash.roleBuyer")}</p>
            <p className="mt-2 text-sm text-ink-muted">{t("dash.roleBuyerBody")}</p>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
