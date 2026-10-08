import { motion, useReducedMotion } from "framer-motion"
import { coordNodes, pulseKeys } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

export function CoordinationFlow({ active }: { active: number }) {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const width = 320
  const top = 18
  const gap = 42
  const height = top + gap * (coordNodes.length - 1) + 22

  return (
    <article className="border border-line bg-forest-deep p-4 text-white lg:min-h-full">
      <p className={`text-[11px] text-white/45 ${kickerClass}`}>{t("dash.coordTitle")}</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-auto w-full" role="img" aria-hidden="true">
        {coordNodes.map((node, index) => {
          if (index === coordNodes.length - 1) return null
          const y1 = top + gap * index
          const y2 = top + gap * (index + 1)
          return (
            <g key={`${node.id}-link`}>
              <path
                d={`M 18 ${y1 + 8} L 18 ${y2 - 8}`}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1"
                fill="none"
              />
              {!reduce ? (
                <motion.circle
                  r="2.2"
                  fill="#2f8a62"
                  cx={18}
                  initial={{ cy: y1 + 10, opacity: 0.2 }}
                  animate={{ cy: [y1 + 10, y2 - 10], opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 2.2,
                    delay: index * 0.25,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ) : null}
            </g>
          )
        })}
        {coordNodes.map((node, index) => {
          const y = top + gap * index
          const litIndex = [0, 2, 3, 4, 5][active] ?? 0
          const lit = index === litIndex
          return (
            <g key={node.id}>
              <circle
                cx={18}
                cy={y}
                r="5"
                fill={lit ? "#2f8a62" : "#0a241c"}
                stroke={lit ? "#d4a017" : "rgba(255,255,255,0.4)"}
                strokeWidth="1.2"
              />
              <text
                x={34}
                y={y + 4}
                fill={lit ? "#ffffff" : "rgba(255,255,255,0.62)"}
                fontSize="11"
                style={{ fontFamily: "inherit" }}
              >
                {t(node.labelKey)}
              </text>
            </g>
          )
        })}
      </svg>
      <p className="mt-4 min-h-[2.5rem] text-sm leading-snug text-leaf">{t(pulseKeys[active])}</p>
    </article>
  )
}
