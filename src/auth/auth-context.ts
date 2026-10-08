import type { User } from "firebase/auth"
import { createContext, useContext } from "react"

export type AuthContextValue = {
  user: User | null
  loading: boolean
  signingIn: boolean
  signInError: string | null
  signInWithGoogle: () => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
