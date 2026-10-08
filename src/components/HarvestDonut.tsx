import { motion, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { demoHarvest, donutSegments, formatKg } from "../data/landingPageData"
import { cinematicEase } from "../motion"
import { useTranslation } from "../i18n/LanguageProvider"

const RADIUS = 72
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function HarvestDonut() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [hovered, setHovered] = useState<string | null>(null)
  const [spin, setSpin] = useState(false)
  const drawn = inView || Boolean(reduce)

  useEffect(() => {
    if (!drawn || reduce) return
    const id = window.setTimeout(() => setSpin(true), 1700)
    return () => window.clearTimeout(id)
  }, [drawn, reduce])

  const segments = donutSegments.reduce<
    { id: string; percent: number; color: string; length: number; offset: number; mid: number }[]
  >((acc, segment) => {
    const length = (segment.percent / 100) * CIRCUMFERENCE
    const offset = acc.reduce((sum, item) => sum + item.length, 0)
    const startDeg = -90 + (offset / CIRCUMFERENCE) * 360
    const mid = startDeg + (segment.percent / 100) * 180
    acc.push({
      id: segment.id,
      percent: segment.percent,
      color: segment.color,
      length,
      offset,
      mid,
    })
    return acc
  }, [])

  return (
    <section className="bg-canvas py-24 sm:py-32" ref={ref}>
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div className="min-w-0">
          <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("donut.kicker")}</p>
          <h2 className="font-display mt-4 text-[clamp(1.95rem,4vw,3.4rem)] leading-[1.12] tracking-[-0.03em] text-ink">
            {t("donut.title")}
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-ink-muted">{t("donut.body")}</p>
          <ul className="mt-10 space-y-4">
            {segments.map((segment, index) => {
              const active = hovered === segment.id
              return (
                <motion.li
                  key={segment.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={drawn ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ delay: 1.35 + index * 0.1, duration: 0.4, ease: cinematicEase }}
                >
                  <button
                    type="button"
                    className={`flex w-full items-baseline justify-between gap-4 border-b px-0 py-3 text-left transition-opacity duration-300 focus-visible:outline focus-visible:outline-offset-4 focus-visible:outline-forest ${
                      active ? "border-forest opacity-100" : hovered ? "border-line opacity-35" : "border-line"
                    }`}
                    onMouseEnter={() => setHovered(segment.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(segment.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <span className="min-w-0 text-sm leading-snug">{t(`donut.${segment.id}`)}</span>
                    <span className="shrink-0 font-display text-2xl">{segment.percent}%</span>
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <motion.svg
            viewBox="0 0 200 200"
            className="h-auto w-full overflow-visible"
            role="img"
            aria-label={`${t("donut.title")} · ${formatKg(demoHarvest.expectedKg)}`}
          >
            <motion.g
              animate={spin && !reduce ? { rotate: 360 } : { rotate: 0 }}
              transition={
                spin && !reduce
                  ? { duration: 12, repeat: Infinity, ease: "linear" }
                  : { duration: 0.6, ease: cinematicEase }
              }
              style={{ transformOrigin: "100px 100px" }}
            >
              <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#ddd6c8" strokeWidth="16" />
              {segments.map((segment, index) => {
                const active = hovered === segment.id
                return (
                  <motion.circle
                    key={segment.id}
                    cx="100"
                    cy="100"
                    r={RADIUS}
                    fill="none"
                    stroke={segment.color}
                    strokeWidth={active ? 22 : 16}
                    strokeLinecap="butt"
                    strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                    transform="rotate(-90 100 100)"
                    initial={{ strokeDashoffset: CIRCUMFERENCE }}
                    animate={{
                      strokeDashoffset: drawn ? -segment.offset : CIRCUMFERENCE,
                      opacity: drawn ? (hovered && !active ? 0.28 : 1) : 0,
                    }}
                    transition={{
                      duration: reduce ? 0 : 0.55,
                      delay: reduce ? 0 : 0.08 + index * 0.48,
                      ease: cinematicEase,
                    }}
                    onMouseEnter={() => setHovered(segment.id)}
                    onMouseLeave={() => setHovered(null)}
                    className="cursor-pointer"
                  />
                )
              })}
            </motion.g>
            {segments.map((segment) => {
              const active = hovered === segment.id
              const rad = (segment.mid * Math.PI) / 180
              const reach = active ? 108 : 94
              return (
                <motion.text
                  key={`${segment.id}-label`}
                  x={100 + Math.cos(rad) * reach}
                  y={100 + Math.sin(rad) * reach}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={segment.color}
                  fontSize="11"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: drawn ? (hovered && !active ? 0.25 : 1) : 0,
                    x: 100 + Math.cos(rad) * reach,
                    y: 100 + Math.sin(rad) * reach,
                  }}
                  transition={{ duration: 0.35, delay: drawn ? 1.2 : 0, ease: cinematicEase }}
                  className="pointer-events-none"
                >
                  {segment.percent}%
                </motion.text>
              )
            })}
          </motion.svg>
          <motion.div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: drawn ? 1 : 0, scale: drawn ? 1 : 0.96 }}
            transition={{ delay: reduce ? 0 : 1.25, duration: 0.4, ease: cinematicEase }}
          >
            <p className="font-display text-4xl text-ink">{formatKg(demoHarvest.expectedKg)}</p>
            <p className={`mt-1 text-[11px] leading-snug text-ink-muted ${kickerClass}`}>
              {t("donut.harvest")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
