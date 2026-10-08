import { motion, useReducedMotion } from "framer-motion"
import { demoImpact } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { CountUp } from "./CountUp"

export function ImpactMetrics() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section id="impact" className="scroll-mt-20 bg-canvas-warm">
      <div className="mx-auto max-w-6xl px-5 py-24 sm:px-8 lg:py-32">
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-[11px] text-leaf ${kickerClass}`}
        >
          {t("impact.kicker")}
        </motion.p>
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 22, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-display mt-4 text-[clamp(1.85rem,4.5vw,3.75rem)] leading-snug text-ink"
        >
          {t("impact.title")}
        </motion.h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">{t("impact.note")}</p>

        <div className="mt-16 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
          {demoImpact.map((metric, index) => (
            <motion.article
              key={metric.key}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
              className="bg-canvas-warm px-5 py-10"
            >
              <p className="font-display text-4xl tracking-tight text-forest sm:text-5xl">
                <CountUp
                  target={metric.target}
                  prefix={metric.prefix}
                  suffix={metric.suffix}
                  durationMs={900}
                />
              </p>
              <p className="mt-3 text-sm leading-snug text-ink-muted">{t(metric.labelKey)}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
