import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import { coordinationNodes } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { AINetwork } from "./AINetwork"

export function ImpactNetwork() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = window.setInterval(() => {
      setActive((value) => (value + 1) % coordinationNodes.length)
    }, 2400)
    return () => window.clearInterval(id)
  }, [reduce])

  return (
    <section id="ai-network" className="scroll-mt-20 bg-ink py-24 text-white sm:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className={`text-[11px] text-white/45 ${kickerClass}`}>{t("coordSection.kicker")}</p>
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            className="font-display mt-4 text-[clamp(1.85rem,4.5vw,3.75rem)] leading-snug"
          >
            {t("coordSection.title")}
          </motion.h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/65">{t("coordSection.body")}</p>
          <p className={`mt-6 inline-flex items-center gap-2 text-[11px] text-leaf ${kickerClass}`}>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
            {t("coordSection.active")}
          </p>
        </div>
        <div className="border border-white/10 bg-white/[0.03] p-6">
          <AINetwork
            nodes={coordinationNodes.map((node) => ({
              id: node.id,
              label: t(`coord.${node.id}`),
            }))}
            activeIndex={active}
          />
        </div>
      </div>
    </section>
  )
}
