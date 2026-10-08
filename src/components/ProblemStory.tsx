import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { landingImages, lifecycleStages } from "../data/landingPageData"
import { cinematicEase } from "../motion"
import { useTranslation } from "../i18n/LanguageProvider"
import { CinematicImage } from "./CinematicImage"

export function ProblemStory() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.45"],
  })
  const [step, setStep] = useState(reduce ? lifecycleStages.length - 1 : 0)

  useEffect(() => {
    if (reduce) {
      setStep(lifecycleStages.length - 1)
      return
    }
    const value = scrollYProgress.get()
    setStep(
      Math.min(
        lifecycleStages.length - 1,
        Math.max(0, Math.round(value * (lifecycleStages.length - 1))),
      ),
    )
  }, [reduce, scrollYProgress])

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduce) return
    const next = Math.min(
      lifecycleStages.length - 1,
      Math.max(0, Math.round(value * (lifecycleStages.length - 1))),
    )
    setStep(next)
  })

  const draw = (step + 1) / lifecycleStages.length

  return (
    <section id="problem" ref={ref} className="relative min-h-[92svh] overflow-hidden bg-ink text-white">
      <CinematicImage
        src={landingImages.problem.src}
        alt={landingImages.problem.alt}
        className="absolute inset-0 h-full w-full"
        overlay="dark"
        reveal="up"
        clipReveal
      />
      <div className="relative mx-auto flex min-h-[92svh] w-full max-w-6xl items-end px-5 py-20 sm:px-8 lg:py-24">
        <div className="w-full">
          <motion.h2
            initial={reduce ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.55, ease: cinematicEase }}
            className="font-display max-w-4xl text-[clamp(2rem,4.8vw,4.1rem)] leading-[1.08] tracking-[-0.03em]"
          >
            {t("problem.title")}
            <span className="mt-4 block font-normal text-white/72">{t("problem.subtitle")}</span>
          </motion.h2>

          <div className="relative mt-16">
            <div className="absolute top-3 right-0 left-0 hidden h-px origin-left bg-white/15 md:block" />
            <motion.div
              className="absolute top-3 left-0 hidden h-px w-full origin-left bg-leaf md:block"
              animate={{ scaleX: draw }}
              transition={{ duration: 0.35, ease: cinematicEase }}
              aria-hidden="true"
            />
            <ol className="grid gap-8 md:grid-cols-5">
              {lifecycleStages.map((stage, index) => {
                const active = index <= step
                return (
                  <li key={stage.id} className="relative">
                    <motion.span
                      className={`relative z-10 mb-4 block h-2 w-2 rounded-full md:mx-0 ${
                        active ? "bg-leaf" : "bg-white/25"
                      }`}
                      animate={{ scale: index === step ? 1.35 : 1 }}
                    />
                    <p
                      className={`text-sm font-medium leading-snug ${kickerClass} ${
                        active ? "text-white" : "text-white/35"
                      }`}
                    >
                      {t(`problem.${stage.id}`)}
                    </p>
                    <p
                      className={`mt-3 max-w-xs text-sm leading-relaxed ${
                        index === step
                          ? "text-white/70 opacity-100"
                          : active
                            ? "text-white/45 opacity-100"
                            : "opacity-0"
                      }`}
                    >
                      {t(`problem.${stage.id}Body`)}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
