import type { User } from "firebase/auth"

export function operatorName(user: User | null, fallback: string) {
  const display = user?.displayName?.trim()
  if (display) return display
  const email = user?.email?.trim()
  if (email) return email
  return fallback
}

export function operatorFirstName(user: User | null, fallback: string) {
  const display = user?.displayName?.trim()
  if (display) return display.split(/\s+/)[0] ?? display
  const email = user?.email?.trim()
  if (email) return email
  return fallback
}

export function operatorInitial(name: string) {
  const ch = name.trim().charAt(0)
  return ch ? ch.toUpperCase() : "F"
}
