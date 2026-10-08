import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { farmTelemetry } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

export function FarmTelemetry() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  const bars = [
    { key: "health", label: t("dash.cropHealth"), value: farmTelemetry.health, suffix: "%" },
    { key: "humidity", label: t("dash.humidity"), value: farmTelemetry.humidity, suffix: "%" },
    { key: "soil", label: t("dash.soilMoisture"), value: farmTelemetry.soil, suffix: "%" },
  ]

  return (
    <section id="farm-intel" ref={ref} className="scroll-mt-24 border border-line bg-card p-5 sm:p-6">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.farmPanelTitle")}</p>
      <p className="mt-2 text-[12px] text-ink-muted">{t("dash.demoNote")}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Item label={t("dash.crop")} value={t("dash.tomato")} />
        <Item label={t("dash.area")} value={t("dash.acres")} />
        <Item label={t("dash.weather")} value={`${farmTelemetry.weatherC}°C`} />
        <Item label={t("dash.irrigation")} value={t("dash.optimal")} />
        <Item label={t("dash.stressRisk")} value={t("dash.low")} />
      </dl>
      <ul className="mt-5 space-y-3">
        {bars.map((bar) => (
          <li key={bar.key}>
            <div className="flex justify-between text-[12px]">
              <span>{bar.label}</span>
              <span>
                {bar.value}
                {bar.suffix}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden bg-line">
              <motion.div
                className="h-full bg-leaf"
                initial={{ width: reduce ? `${bar.value}%` : 0 }}
                animate={{ width: inView || reduce ? `${bar.value}%` : 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line px-3 py-2">
      <dt className="text-[11px] text-ink-muted">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
