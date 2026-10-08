import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"

export function FeatureFrame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: ReactNode
}) {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6">
      <Link to="/dashboard" className="text-[12px] text-forest hover:underline">
        ← {t("dash.navDashboard")}
      </Link>
      <h1 className="font-display mt-3 text-[clamp(1.5rem,3vw,2.1rem)] leading-snug">{title}</h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-sm text-ink-muted">{subtitle}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  )
}
