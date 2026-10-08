import { useTranslation } from "../i18n/LanguageProvider"
import { useAuth } from "../auth/auth-context"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { Sprout, Store, X } from "lucide-react"
import { loadUserProfile, type UserRole } from "../lib/userProfile"
import { homePathForUser } from "../lib/roleHome"
import { setPendingRole } from "../lib/pendingRole"

type GoogleSignInButtonProps = {
  className?: string
  variant?: "primary" | "on-dark" | "ghost"
}

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.8-4.1 2.8-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3 5.5 15.2l-3.1 2.4C4.3 21 7.9 23 12 23c3 0 5.5-1 7.3-2.8l-3.1-2.4c-.9.6-2 1-3.2 1-2.5 0-4.6-1.7-5.4-3.9z"
      />
      <path
        fill="#FBBC05"
        d="M3.4 7.4C2.5 9.1 2 11 2 13s.5 3.9 1.4 5.6l3.2-2.5C6.2 14.9 6 14 6 13s.2-1.9.6-2.7z"
      />
      <path
        fill="#4285F4"
        d="M12 6c1.6 0 3.1.6 4.2 1.6l2.8-2.8C17.4 2.9 14.9 2 12 2 7.9 2 4.3 4 2.4 7.4l3.2 2.5C6.4 7.7 8.5 6 12 6z"
      />
    </svg>
  )
}

export function GoogleSignInButton({
  className = "",
  variant = "primary",
}: GoogleSignInButtonProps) {
  const { t } = useTranslation()
  const { user, signInWithGoogle, signingIn, signInError } = useAuth()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<UserRole | null>(null)

  const styles = {
    primary:
      "bg-forest text-white hover:bg-forest-deep shadow-[0_1px_2px_rgba(12,46,35,0.18)]",
    "on-dark":
      "bg-white text-ink hover:bg-canvas-warm shadow-[0_1px_2px_rgba(0,0,0,0.08)]",
    ghost:
      "border border-line bg-card text-ink hover:border-forest/25 hover:bg-white",
  }[variant]

  function startSignIn() {
    // Always open role picker so Buyer selection is never skipped when already signed in.
    const profile = user ? loadUserProfile(user.uid) : null
    if (profile?.role) setRole(profile.role)
    setOpen(true)
  }

  async function continueWithGoogle() {
    if (!role) return
    setPendingRole(role)
    setOpen(false)
    if (user) {
      // Already authenticated — apply pending role and route (supports Farmer ↔ Buyer switch).
      const dest = homePathForUser(user)
      console.log("[RIPE AUTH] Role continue (existing session)", { role, dest })
      navigate(dest, { replace: true })
      return
    }
    const ok = await signInWithGoogle()
    if (!ok) {
      // keep pending role so a retry can still apply after a successful later login
    }
  }

  return (
    <span className="inline-flex max-w-full flex-col items-stretch">
      <button
        type="button"
        disabled={signingIn}
        onClick={startSignIn}
        aria-busy={signingIn}
        className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium leading-snug tracking-tight whitespace-normal transition-colors duration-200 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-leaf disabled:cursor-wait disabled:opacity-70 ${styles} ${className}`}
      >
        <GoogleMark />
        {signingIn ? t("dash.connecting") : t("nav.signIn")}
      </button>
      {signInError ? (
        <span role="alert" className="mt-2 max-w-xs text-left text-[11px] leading-snug text-urgent">
          {t(signInError)}
        </span>
      ) : null}

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="role-pick-title"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="w-full max-w-lg rounded-2xl border border-line bg-card p-5 shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-leaf">RipeRoute</p>
                  <h2 id="role-pick-title" className="font-display mt-1 text-2xl text-ink">
                    {t("dash.roleHowTitle")}
                  </h2>
                </div>
                <button type="button" aria-label={t("dash.close")} onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 text-ink-muted" />
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "farmer" ? "border-forest bg-canvas-warm" : "border-line hover:border-forest/40"
                  }`}
                  onClick={() => setRole("farmer")}
                >
                  <Sprout className="h-6 w-6 text-forest" />
                  <p className="mt-3 text-base font-semibold">🌱 {t("dash.roleFarmer")}</p>
                  <p className="mt-1 text-[12px] text-ink-muted">{t("dash.roleFarmerBody")}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border p-4 text-left transition ${
                    role === "buyer" ? "border-forest bg-canvas-warm" : "border-line hover:border-forest/40"
                  }`}
                  onClick={() => setRole("buyer")}
                >
                  <Store className="h-6 w-6 text-forest" />
                  <p className="mt-3 text-base font-semibold">🏪 {t("dash.roleBuyer")}</p>
                  <p className="mt-1 text-[12px] text-ink-muted">{t("dash.roleBuyerBody")}</p>
                </button>
              </div>

              <button
                type="button"
                disabled={!role || signingIn}
                onClick={() => void continueWithGoogle()}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <GoogleMark />
                {signingIn ? t("dash.connecting") : t("dash.continueWithGoogle")}
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </span>
  )
}
