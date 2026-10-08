import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { demoHarvest, formatKg } from "../data/landingPageData"
import { cinematicEase } from "../motion"
import { useTranslation } from "../i18n/LanguageProvider"

function stageFromProgress(value: number) {
  if (value < 0.12) return 0
  if (value < 0.32) return 1
  if (value < 0.48) return 2
  if (value < 0.66) return 3
  if (value < 0.84) return 4
  return 5
}

function FlowPulse({
  d,
  active,
  color,
  duration,
}: {
  d: string
  active: boolean
  color: string
  duration: number
}) {
  if (!active) return null
  return (
    <motion.circle
      r="3.2"
      fill={color}
      style={{ offsetPath: `path("${d}")`, offsetRotate: "0deg" }}
      animate={{ offsetDistance: ["0%", "100%"] }}
      transition={{ duration, repeat: Infinity, ease: "linear" }}
    />
  )
}

export function SurplusStory() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.82", "end 0.28"],
  })
  const [stage, setStage] = useState(reduce ? 5 : 0)

  useEffect(() => {
    if (reduce) {
      setStage(5)
      return
    }
    setStage(stageFromProgress(scrollYProgress.get()))
  }, [reduce, scrollYProgress])

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduce) return
    setStage(stageFromProgress(value))
  })

  const showDemand = stage >= 1
  const surplusEmphasis = stage >= 2
  const splitSurplus = stage >= 3
  const showRoute = stage >= 4
  const showRedirect = stage >= 5

  const trunk = "M200 58 L200 118"
  const toDemand = "M200 118 L78 178"
  const toSurplus = "M200 118 L322 178"
  const toBuyer = "M322 248 L78 318"
  const toRescue = "M322 248 L322 318"
  const converge = "M78 368 L200 418 M322 368 L200 418"

  return (
    <section id="surplus" ref={ref} className="bg-forest-deep py-24 text-white sm:py-32">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <p className={`text-[11px] text-white/40 ${kickerClass}`}>{t("surplus.kicker")}</p>
        <h2 className="font-display mt-3 max-w-3xl text-[clamp(1.85rem,4.2vw,3.4rem)] leading-[1.12] tracking-[-0.03em]">
          {t("surplus.title")}
        </h2>

        <div className="relative mt-12">
          <svg
            className="pointer-events-none absolute inset-x-0 top-8 hidden h-[28rem] w-full text-white/20 sm:block"
            viewBox="0 0 400 460"
            aria-hidden="true"
          >
            <motion.path
              d={trunk}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              animate={{ pathLength: stage >= 1 ? 1 : 0, opacity: stage >= 1 ? 1 : 0 }}
              transition={{ duration: 0.4, ease: cinematicEase }}
            />
            <motion.path
              d={toDemand}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              animate={{ pathLength: showDemand ? 1 : 0, opacity: showDemand ? 1 : 0 }}
            />
            <motion.path
              d={toSurplus}
              fill="none"
              stroke={surplusEmphasis ? "#d4a017" : "currentColor"}
              strokeWidth="1.2"
              animate={{ pathLength: showDemand ? 1 : 0, opacity: showDemand ? 1 : 0 }}
            />
            <motion.path
              d={toBuyer}
              fill="none"
              stroke="#3dcc7a"
              strokeWidth="1.2"
              animate={{ pathLength: splitSurplus ? 1 : 0, opacity: splitSurplus ? 1 : 0 }}
            />
            <motion.path
              d={toRescue}
              fill="none"
              stroke="#3dcc7a"
              strokeWidth="1.2"
              animate={{ pathLength: splitSurplus ? 1 : 0, opacity: splitSurplus ? 1 : 0 }}
            />
            <motion.path
              d={converge}
              fill="none"
              stroke="#3dcc7a"
              strokeWidth="1.2"
              animate={{ pathLength: showRedirect ? 1 : 0, opacity: showRedirect ? 1 : 0 }}
            />
            {!reduce ? (
              <>
                <FlowPulse d={trunk} active={stage >= 1 && stage < 3} color="#3dcc7a" duration={1.1} />
                <FlowPulse d={toDemand} active={showDemand} color="#ffffff" duration={1.3} />
                <FlowPulse d={toSurplus} active={surplusEmphasis} color="#d4a017" duration={1.2} />
                <FlowPulse d={toBuyer} active={splitSurplus} color="#3dcc7a" duration={1.25} />
                <FlowPulse d={toRescue} active={splitSurplus} color="#3dcc7a" duration={1.35} />
              </>
            ) : null}
          </svg>

          <motion.div
            animate={{
              opacity: stage === 0 ? 1 : 0.28,
              scale: stage === 0 ? 1 : 0.72,
              y: stage === 0 ? 0 : -12,
            }}
            transition={{ duration: 0.45, ease: cinematicEase }}
            className="relative z-10 text-center"
          >
            <p className="font-display text-6xl tracking-tight sm:text-8xl">
              {formatKg(demoHarvest.expectedKg)}
            </p>
            <p className={`mt-2 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
              {t("surplus.harvest")}
            </p>
          </motion.div>

          <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={false}
              animate={{
                opacity: showDemand ? 1 : 0,
                x: showDemand ? 0 : -36,
                scale: showDemand ? 1 : 0.94,
              }}
              transition={{ duration: 0.45, ease: cinematicEase }}
              className="border border-white/10 bg-white/5 px-6 py-6"
            >
              <p className="font-display text-4xl sm:text-5xl">{formatKg(demoHarvest.demandKg)}</p>
              <p className={`mt-2 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
                {t("surplus.demand")}
              </p>
            </motion.div>

            <motion.div
              initial={false}
              animate={{
                opacity: showDemand ? 1 : 0,
                x: showDemand ? 0 : 36,
                scale: surplusEmphasis ? 1.04 : showDemand ? 1 : 0.94,
              }}
              transition={{ duration: 0.45, ease: cinematicEase }}
              className={`px-6 py-6 ${
                surplusEmphasis ? "border border-amber/50 bg-amber/15" : "border border-white/10 bg-white/5"
              }`}
            >
              <p className={`font-display text-4xl sm:text-5xl ${surplusEmphasis ? "text-amber" : "text-white"}`}>
                {formatKg(demoHarvest.surplusKg)}
              </p>
              <p
                className={`mt-2 text-[11px] leading-snug ${kickerClass} ${
                  surplusEmphasis ? "text-amber/80" : "text-white/50"
                }`}
              >
                {t("surplus.surplus")}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={false}
              animate={{
                opacity: splitSurplus ? 1 : 0,
                x: splitSurplus ? 0 : 28,
                y: splitSurplus ? 0 : -16,
              }}
              transition={{ duration: 0.5, ease: cinematicEase }}
              className="border border-white/10 bg-white/5 px-6 py-5"
            >
              <p className="font-display text-3xl sm:text-4xl">{formatKg(demoHarvest.buyerMatchKg)}</p>
              <p className={`mt-2 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
                {t("surplus.buyer")}
              </p>
            </motion.div>
            <motion.div
              initial={false}
              animate={{
                opacity: splitSurplus ? 1 : 0,
                x: splitSurplus ? 0 : -28,
                y: splitSurplus ? 0 : -16,
              }}
              transition={{ duration: 0.5, delay: splitSurplus ? 0.06 : 0, ease: cinematicEase }}
              className="border border-white/10 bg-white/5 px-6 py-5"
            >
              <p className="font-display text-3xl sm:text-4xl">{formatKg(demoHarvest.rescueKg)}</p>
              <p className={`mt-2 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
                {t("surplus.rescue")}
              </p>
            </motion.div>
          </div>

          <div className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.p
              initial={false}
              animate={{ opacity: showRoute ? 1 : 0, y: showRoute ? 0 : 14, scale: showRoute ? 1 : 0.98 }}
              className="flex-1 border border-leaf/30 bg-leaf/10 px-5 py-4 text-sm leading-snug"
            >
              {t("surplus.route")}
            </motion.p>
            <motion.p
              initial={false}
              animate={{
                opacity: showRedirect ? 1 : 0,
                y: showRedirect ? 0 : 14,
                scale: showRedirect ? 1 : 0.98,
              }}
              className="flex-1 border border-[#3dcc7a]/40 bg-[#3dcc7a]/10 px-5 py-4 text-sm leading-snug"
            >
              {t("surplus.redirect")}
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  )
}
