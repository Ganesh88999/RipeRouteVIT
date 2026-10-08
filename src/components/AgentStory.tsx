import { motion, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { agentCopyPrefix, agentStory } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { AINetwork } from "./AINetwork"

export function AgentStory() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.4 })
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (reduce || !inView) return
    const id = window.setInterval(() => {
      setStep((value) => (value + 1) % agentStory.length)
      }, 2200)
    return () => window.clearInterval(id)
  }, [reduce, inView])

  const prefix = agentCopyPrefix[agentStory[step].id]
  const signalKeys =
    prefix === "res"
      ? [`how.${prefix}S1`, `how.${prefix}S2`, `how.${prefix}S3`]
      : [`how.${prefix}S1`, `how.${prefix}S2`, `how.${prefix}S3`, `how.${prefix}S4`]

  return (
    <section
      id="how-it-works"
      ref={ref}
      className="scroll-mt-20 bg-canvas px-5 py-24 sm:px-8 lg:py-32"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="border border-line bg-forest-deep p-6 text-white lg:min-h-[34rem]">
          <p className={`text-[11px] text-white/45 ${kickerClass}`}>{t("how.network")}</p>
          <AINetwork
            nodes={agentStory.map((item) => ({
              id: item.id,
              label: t(`how.${agentCopyPrefix[item.id]}Name`),
            }))}
            activeIndex={step}
            status={t(`how.${prefix}Status`)}
            className="mt-6"
          />
        </div>

        <div className="min-w-0">
          <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("how.kicker")}</p>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display mt-4 text-[clamp(1.95rem,4.2vw,3.9rem)] leading-[1.1] tracking-[-0.03em] text-ink"
          >
            {t("how.title")}
            <br />
            {t("how.title2")}
          </motion.h2>
          <motion.div
            key={agentStory[step].id}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10"
          >
            <p className="font-display text-6xl text-forest/20">0{step + 1}</p>
            <h3 className="mt-2 text-lg font-medium leading-snug">{t(`how.${prefix}Name`)}</h3>
            <p className="mt-4 max-w-md text-lg leading-relaxed text-ink-muted">
              {t(`how.${prefix}Body`)}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {signalKeys.map((key) => (
                <li
                  key={key}
                  className="border border-line px-3 py-1 text-[11px] leading-snug text-ink-muted"
                >
                  {t(key)}
                </li>
              ))}
            </ul>
          </motion.div>
          <ol className="mt-10 flex gap-2" aria-label={t("how.kicker")}>
            {agentStory.map((item, index) => (
              <li
                key={item.id}
                className={`h-1 flex-1 ${index <= step ? "bg-forest" : "bg-line"}`}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
