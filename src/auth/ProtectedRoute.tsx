import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "./auth-context"
import { AuthSplash } from "./AuthSplash"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return <AuthSplash />
  if (!user) return <Navigate to="/" replace />
  return children
}
