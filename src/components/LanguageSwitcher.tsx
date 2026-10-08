import { Check, ChevronDown, Globe } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { languages } from "../i18n/languages"
import { useTranslation } from "../i18n/LanguageProvider"

type LanguageSwitcherProps = {
  tone?: "on-dark" | "on-light"
}

export function LanguageSwitcher({ tone = "on-dark" }: LanguageSwitcherProps) {
  const { language, setLanguage, t, isEnglish } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const current = languages.find((item) => item.code === language) ?? languages[0]

  useEffect(() => {
    if (!open) return

    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={
          tone === "on-light"
            ? "inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-line bg-card px-2.5 py-1.5 text-ink transition-colors hover:bg-canvas-warm focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-forest"
            : "inline-flex max-w-[11rem] items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
        }
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={t("nav.language")}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden="true" />
        <span className="truncate text-[12px] leading-none">
          <span className="md:hidden">{current.short}</span>
          <span className="hidden md:inline">{isEnglish ? current.short : current.native}</span>
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-label={t("nav.language")}
          className="absolute right-0 z-[60] mt-2 w-[min(18rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-line bg-card text-ink shadow-[0_18px_40px_-24px_rgba(12,46,35,0.55)] max-md:fixed max-md:right-4 max-md:bottom-4 max-md:left-4 max-md:mt-0 max-md:w-auto"
        >
          <ul className="max-h-[min(24rem,70svh)] overflow-y-auto py-1">
            {languages.map((item) => {
              const selected = item.code === language
              return (
                <li key={item.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors hover:bg-canvas-warm focus-visible:bg-canvas-warm focus-visible:outline-none ${
                      selected ? "bg-forest/[0.06]" : ""
                    }`}
                    onClick={() => {
                      setLanguage(item.code)
                      setOpen(false)
                    }}
                  >
                    <span>
                      <span className="block text-sm leading-snug">{item.native}</span>
                      <span className="block text-[11px] text-ink-muted">{item.english}</span>
                    </span>
                    {selected ? (
                      <Check className="h-4 w-4 shrink-0 text-forest" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
