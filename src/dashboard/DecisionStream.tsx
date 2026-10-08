import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { streamSeed } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

export function DecisionStream() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const [visible, setVisible] = useState(reduce ? 4 : 1)
  const [all, setAll] = useState(false)

  useEffect(() => {
    if (reduce || all) return
    const cap = Math.min(4, streamSeed.length)
    if (visible >= cap) return
    const id = window.setTimeout(() => setVisible((value) => value + 1), 700)
    return () => window.clearTimeout(id)
  }, [reduce, visible, all])

  const events = streamSeed.slice(0, all ? streamSeed.length : Math.min(visible, 4))

  return (
    <section id="stream" className="scroll-mt-24 dash-card p-5">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>Latest AI Actions</p>
      <p className="mt-2 text-[12px] text-ink-muted">{t("dash.simulatedStream")}</p>
      <ol className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-b border-line pb-3 last:border-0"
            >
              <p className="text-[11px] text-ink-muted">
                {event.time} · {t(event.agentKey)}
              </p>
              <p className="mt-1 text-sm leading-snug">{t(event.bodyKey)}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {streamSeed.length > 4 && !all ? (
        <button type="button" className="dash-btn mt-3 text-[12px]" onClick={() => setAll(true)}>
          View all
        </button>
      ) : null}
    </section>
  )
}
