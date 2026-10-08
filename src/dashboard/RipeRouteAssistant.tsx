import { Sparkles, X } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"

export function RipeRouteAssistant() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [reply, setReply] = useState("")

  const prompts = [
    { key: "dash.aiP1", reply: "dash.aiReplyIrrigate", to: "/irrigation" },
    { key: "dash.aiP2", reply: "dash.aiReplySurplus", to: "/yield-surplus" },
    { key: "dash.aiP3", reply: "dash.aiReplyBuyers", to: "/buyer-matching" },
    { key: "dash.aiP4", reply: "dash.aiReplyUnsold", to: "/food-rescue" },
    { key: "dash.aiP5", reply: "dash.aiReplySchemes", to: "/government-schemes" },
  ]

  return (
    <div className="fixed right-4 bottom-4 z-40">
      {open ? (
        <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] border border-line bg-card p-4 shadow-xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium">{t("dash.aiHello")}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-ink-muted">
            Quick links into farm tools. Answers are guided, not official decisions.
          </p>
          <ul className="mt-3 space-y-2">
            {prompts.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  className="w-full rounded-md border border-line px-3 py-2 text-left text-[12px] hover:border-forest"
                  onClick={() => {
                    setReply(t(item.reply))
                    navigate(item.to)
                    setOpen(false)
                  }}
                >
                  {t(item.key)}
                </button>
              </li>
            ))}
          </ul>
          {reply ? <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed">{reply}</p> : null}
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-sm text-white shadow-lg hover:-translate-y-0.5"
      >
        <Sparkles className="h-4 w-4" />
        {t("dash.aiFab")}
      </button>
    </div>
  )
}
