import { FirebaseError } from "firebase/app"
import {
  GoogleAuthProvider,
  browserPopupRedirectResolver,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../lib/firebase"
import { homePathForUser } from "../lib/roleHome"
import { AuthContext, type AuthContextValue } from "./auth-context"

function errorKey(error: unknown): string | null {
  if (!(error instanceof FirebaseError)) return "dash.signInError"
  switch (error.code) {
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "dash.popupClosed"
    case "auth/popup-blocked":
      return "dash.popupBlocked"
    case "auth/unauthorized-domain":
      return "dash.unauthorizedDomain"
    default:
      return "dash.signInError"
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const inFlight = useRef(false)
  const [user, setUser] = useState<AuthContextValue["user"]>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [signInError, setSignInError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (next) => {
      console.log("[AUTH] Auth state changed", next?.uid)
      setUser(next)
      setLoading(false)
    })
    return unsub
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (inFlight.current) return false
    inFlight.current = true
    setSigningIn(true)
    setSignInError(null)
    console.log("[AUTH] Sign-in started")

    try {
      if (auth.currentUser) {
        setUser(auth.currentUser)
        setLoading(false)
        console.log("[AUTH] Sign-in successful", auth.currentUser.uid)
        const dest = homePathForUser(auth.currentUser)
        console.log("[AUTH] Navigating to", dest)
        navigate(dest, { replace: true })
        return true
      }

      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(
        auth,
        provider,
        browserPopupRedirectResolver,
      )
      console.log("[AUTH] Sign-in successful", result.user.uid)
      setUser(result.user)
      setLoading(false)
      const dest = homePathForUser(result.user)
      console.log("[AUTH] Navigating to", dest)
      navigate(dest, { replace: true })
      return true
    } catch (error) {
      const key = errorKey(error)
      if (key) setSignInError(key)
      return false
    } finally {
      inFlight.current = false
      setSigningIn(false)
    }
  }, [navigate])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setUser(null)
    navigate("/", { replace: true })
  }, [navigate])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signingIn,
      signInError,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signingIn, signInError, signInWithGoogle, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
