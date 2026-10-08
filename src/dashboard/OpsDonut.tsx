import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef, useState } from "react"
import { opsDonut, opsHarvest } from "../data/dashboardDemo"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { cinematicEase } from "../motion"

const RADIUS = 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function OpsDonut() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [hovered, setHovered] = useState<string | null>(null)
  const drawn = inView || reduce

  const segments = opsDonut.reduce<
    { id: string; percent: number; color: string; length: number; offset: number }[]
  >((acc, segment) => {
    const length = (segment.percent / 100) * CIRCUMFERENCE
    const offset = acc.reduce((sum, item) => sum + item.length, 0)
    acc.push({ id: segment.id, percent: segment.percent, color: segment.color, length, offset })
    return acc
  }, [])

  const active = segments.find((item) => item.id === hovered)

  return (
    <section ref={ref} className="border border-line bg-card p-5 sm:p-6">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("donut.kicker")}</p>
      <h2 className="font-display mt-2 text-xl leading-snug">{t("donut.title")}</h2>
      <p className="mt-2 text-[12px] text-ink-muted">{t("dash.demoViz")}</p>
      <div className="mt-4 grid items-center gap-6 sm:grid-cols-2">
        <div className="relative mx-auto w-full max-w-[16rem]">
          <motion.svg
            viewBox="0 0 180 180"
            className="h-auto w-full"
            role="img"
            aria-label={t("donut.title")}
            animate={reduce ? undefined : { rotate: inView ? 6 : 0 }}
            transition={{ duration: 1.2, ease: cinematicEase }}
          >
            <circle cx="90" cy="90" r={RADIUS} fill="none" stroke="#ddd6c8" strokeWidth="14" />
            {segments.map((segment) => {
              const isActive = hovered === segment.id
              return (
                <motion.circle
                  key={segment.id}
                  cx="90"
                  cy="90"
                  r={RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={isActive ? 20 : 14}
                  strokeDasharray={`${segment.length} ${CIRCUMFERENCE - segment.length}`}
                  strokeDashoffset={-segment.offset}
                  transform="rotate(-90 90 90)"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: drawn ? (hovered && !isActive ? 0.28 : 1) : 0,
                  }}
                  transition={{ duration: 0.8, ease: cinematicEase }}
                  onMouseEnter={() => setHovered(segment.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer"
                />
              )
            })}
            {!reduce && inView
              ? [0, 1, 2].map((index) => (
                  <motion.circle
                    key={index}
                    cx={138}
                    cy={90}
                    r="2"
                    fill="#2f8a62"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10 + index,
                      repeat: Infinity,
                      ease: "linear",
                      delay: index * 0.6,
                    }}
                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                    className="hidden sm:block"
                  />
                ))
              : null}
          </motion.svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-display text-2xl">
              {active ? `${active.percent}%` : formatKg(opsHarvest.expectedKg)}
            </p>
            <p className="mt-1 max-w-[7rem] text-[11px] leading-snug text-ink-muted">
              {active ? t(`donut.${active.id}`) : t("donut.harvest")}
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {segments.map((segment) => (
            <li key={segment.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 border-b border-line py-2 text-left text-sm"
                onMouseEnter={() => setHovered(segment.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(segment.id)}
                onBlur={() => setHovered(null)}
              >
                <span className="leading-snug">{t(`donut.${segment.id}`)}</span>
                <span className="font-display">{segment.percent}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
