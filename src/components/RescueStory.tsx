import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import {
  demoHarvest,
  formatKg,
  landingImages,
  rescueFlow,
} from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { CinematicImage } from "./CinematicImage"

export function RescueStory() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink py-24 text-white sm:py-32">
      <CinematicImage
        src={landingImages.rescue.src}
        alt={landingImages.rescue.alt}
        className="absolute inset-0 h-full w-full opacity-40"
        overlay="dark"
        reveal="up"
        clipReveal
      />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <p className={`text-[11px] text-white/45 ${kickerClass}`}>{t("rescue.kicker")}</p>
        <h2 className="font-display mt-4 max-w-3xl text-[clamp(1.85rem,4.5vw,3.75rem)] leading-snug">
          {t("rescue.title")}
        </h2>

        <ol className="mt-16">
          {rescueFlow.map((step, index) => (
            <li key={step.id} className="relative flex gap-5 pb-10 last:pb-0">
              <div className="flex flex-col items-center">
                <motion.span
                  className="h-2.5 w-2.5 rounded-full bg-leaf"
                  initial={reduce ? false : { scale: 0.4, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : undefined}
                  transition={{ delay: index * 0.12, duration: 0.4 }}
                />
                {index < rescueFlow.length - 1 ? (
                  <motion.span
                    className="mt-1 h-12 w-px origin-top bg-white/20"
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={inView ? { scaleY: 1 } : undefined}
                    transition={{ delay: 0.1 + index * 0.12, duration: 0.5 }}
                  />
                ) : null}
              </div>
              <motion.p
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={inView ? { opacity: 1, x: 0 } : undefined}
                transition={{ delay: 0.05 + index * 0.12, duration: 0.45 }}
                className="min-w-0 pb-4 text-sm leading-snug"
              >
                {t(`rescue.${step.id}`)}
              </motion.p>
            </li>
          ))}
        </ol>

        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-3xl">{formatKg(demoHarvest.buyerMatchKg)}</p>
            <p className={`mt-1 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
              {t("rescue.buyerMatch")}
            </p>
          </div>
          <div>
            <p className="font-display text-3xl">{formatKg(demoHarvest.rescueKg)}</p>
            <p className={`mt-1 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
              {t("rescue.rescue")}
            </p>
          </div>
          <div>
            <p className="font-display text-3xl">{demoHarvest.shelfLifeHours} HR</p>
            <p className={`mt-1 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
              {t("rescue.shelf")}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
