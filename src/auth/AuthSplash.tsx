import { Sprout } from "lucide-react"
import { useTranslation } from "../i18n/LanguageProvider"

export function AuthSplash() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-svh items-center justify-center bg-canvas px-6">
      <div className="text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-md border border-line bg-card text-forest">
          <Sprout className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <p className="mt-4 text-sm text-ink-muted">{t("dash.splash")}</p>
      </div>
    </div>
  )
}
