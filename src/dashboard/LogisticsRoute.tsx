import { motion, useReducedMotion } from "framer-motion"
import { logistics } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

const stops = [
  { id: "farm", key: "dash.nodeFarm" },
  { id: "collection", key: "dash.collection" },
  { id: "buyer", key: "dash.buyer" },
  { id: "rescue", key: "dash.rescue" },
] as const

export function LogisticsRoute() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <div className="px-2">
      <svg viewBox="0 0 320 88" className="h-auto w-full" role="img" aria-hidden="true">
        <path
          d="M 24 44 H 296"
          fill="none"
          stroke="#ddd6c8"
          strokeWidth="2"
        />
        {!reduce ? (
          <motion.circle
            r="4"
            fill="#2f8a62"
            cx={24}
            cy={44}
            animate={{ cx: [24, 296] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "linear" }}
          />
        ) : null}
        {stops.map((stop, index) => {
          const x = 24 + index * 90.6
          return (
            <g key={stop.id}>
              <circle cx={x} cy="44" r="6" fill="#123c2e" />
              <text
                x={x}
                y="74"
                textAnchor="middle"
                fontSize="10"
                fill="#5c6158"
                style={{ fontFamily: "inherit" }}
              >
                {t(stop.key)}
              </text>
            </g>
          )
        })}
      </svg>
      <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-[11px] text-ink-muted">{t("dash.eta")}</dt>
          <dd className="mt-1 font-medium">{logistics.eta}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-ink-muted">{t("dash.predShelf")}</dt>
          <dd className="mt-1 font-medium">{logistics.shelf}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-ink-muted">{t("dash.coldChain")}</dt>
          <dd className="mt-1 font-medium">{t("dash.coldRequired")}</dd>
        </div>
      </dl>
    </div>
  )
}
