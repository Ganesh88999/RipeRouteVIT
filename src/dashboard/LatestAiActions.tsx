import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { streamSeed } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

const ICONS = ["🌱", "📈", "🤝", "🚚"] as const

export function LatestAiActions({ limit = 4 }: { limit?: number }) {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const events = streamSeed.slice(0, limit)

  return (
    <section id="stream" className="scroll-mt-24 dash-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className={`text-[11px] text-leaf ${kickerClass}`}>Latest AI Actions</p>
          <p className="mt-1 text-[12px] text-ink-muted">{t("dash.simulatedStream")}</p>
        </div>
        <Link to="/ai-decisions" className="dash-btn text-[12px]">
          View all
        </Link>
      </div>
      <ol className="mt-4 space-y-3">
        <AnimatePresence initial={false}>
          {events.map((event, index) => (
            <motion.li
              key={event.id}
              initial={reduce ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduce ? 0 : index * 0.05 }}
              className="border-b border-line pb-3 last:border-0"
            >
              <p className="text-[11px] text-ink-muted">
                {ICONS[index % ICONS.length]} {t(event.agentKey)} · {event.time}
              </p>
              <p className="mt-1 text-sm leading-snug">{t(event.bodyKey)}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </section>
  )
}
