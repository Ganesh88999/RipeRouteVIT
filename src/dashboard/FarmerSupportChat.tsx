import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Send } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { askFarmerSupport, AiApiError } from "../lib/aiApi"
import { useTranslation } from "../i18n/LanguageProvider"
import { useDemandNetwork } from "./FarmProfileContext"

type ChatMsg = {
  id: string
  role: "farmer" | "ai"
  text: string
}

const MAX_QUESTION_CHARS = 2000

const SUGGESTION_KEYS = [
  "dash.suggestCropArea",
  "dash.suggestYellowLeaves",
  "dash.suggestHeavyRain",
  "dash.suggestReduceWater",
  "dash.suggestSchemes",
  "dash.suggestFindBuyers",
  "dash.suggestUnsold",
  "dash.suggestIrrigationMeaning",
] as const

export function FarmerSupportChat() {
  const { t, language } = useTranslation()
  const reduce = useReducedMotion()
  const { farmerProfile } = useDemandNetwork()
  const [input, setInput] = useState("")
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0 || (prev.length === 1 && prev[0]?.id === "welcome")) {
        return [{ id: "welcome", role: "ai", text: t("dash.supportWelcome") }]
      }
      return prev.map((msg) =>
        msg.id === "welcome" ? { ...msg, text: t("dash.supportWelcome") } : msg,
      )
    })
  }, [language, t])

  const suggestions = useMemo(() => SUGGESTION_KEYS.map((key) => t(key)), [t])

  async function send(question: string) {
    const q = question.trim()
    if (!q || busy) return
    if (q.length > MAX_QUESTION_CHARS) {
      setMessages((prev) => [
        ...prev,
        { id: `f-${Date.now()}`, role: "farmer", text: `${q.slice(0, 80)}…` },
        {
          id: `e-${Date.now()}`,
          role: "ai",
          text: t("dash.supportQuestionTooLong"),
        },
      ])
      setInput("")
      return
    }
    setInput("")
    setMessages((prev) => [...prev, { id: `f-${Date.now()}`, role: "farmer", text: q }])
    setBusy(true)
    try {
      const result = await askFarmerSupport({
        question: q,
        crop: farmerProfile?.selectedCrop ?? undefined,
        location: farmerProfile?.locationName,
        state: farmerProfile?.state ?? undefined,
        farmSizeAcres: farmerProfile?.farmSizeAcres ?? undefined,
        growthStage: farmerProfile?.growthStage,
        waterAvailability: farmerProfile?.irrigation,
      })
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "ai",
          text: result.answer,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "ai",
          text: err instanceof AiApiError ? err.message : t("dash.supportAiUnavailable"),
        },
      ])
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] flex-col rounded-md border border-line bg-card sm:min-h-[32rem]">
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-semibold">{t("dash.supportTitleFull")}</h2>
        <p className="mt-1 text-[12px] text-ink-muted">{t("dash.supportSubtitle")}</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-line px-4 py-3">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-full border border-line px-3 py-1 text-[11px] hover:border-forest"
            onClick={() => void send(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[92%] rounded-md px-3 py-2 text-sm ${
                msg.role === "farmer"
                  ? "ml-auto bg-forest text-white"
                  : "border border-line bg-canvas-warm text-ink"
              }`}
            >
              <p className="text-[10px] opacity-70">
                {msg.role === "farmer" ? t("dash.farmer") : t("dash.ripeRouteAi")}
              </p>
              <p className="mt-1 leading-relaxed">{msg.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy ? <p className="text-[12px] text-ink-muted">{t("dash.thinking")}</p> : null}
      </div>

      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault()
          void send(input)
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("dash.askPlaceholder")}
          maxLength={MAX_QUESTION_CHARS + 50}
          className="min-w-0 flex-1 rounded-full border border-line px-4 py-2 text-sm"
        />
        <button type="submit" className="dash-btn dash-btn-primary" disabled={busy || !input.trim()}>
          <Send className="h-4 w-4" />
          <span className="ml-1">{t("dash.send")}</span>
        </button>
      </form>

      <p className="border-t border-line px-4 py-2 text-[11px] text-ink-muted">{t("dash.supportDisclaimer")}</p>
    </div>
  )
}
