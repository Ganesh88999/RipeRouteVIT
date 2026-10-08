import { useState, type ReactNode } from "react"
import { useTranslation } from "../i18n/LanguageProvider"

export function ExpandSection({
  label,
  children,
  defaultOpen = false,
}: {
  label: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const { t } = useTranslation()

  return (
    <div>
      <button
        type="button"
        className="dash-btn text-[12px] text-forest"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? t("dash.showLess") : label}
      </button>
      <div className={open ? "mt-3" : "hidden"}>{children}</div>
    </div>
  )
}
