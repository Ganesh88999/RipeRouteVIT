import { motion, useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { useLiveFarm } from "./liveFarm"

export function SurplusSplit({ showRun = false }: { showRun?: boolean }) {
  const { t, kickerClass } = useTranslation()
  const { harvestKg, demandKg } = useLiveFarm()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.35 })
  const [stage, setStage] = useState(0)
  const [runId, setRunId] = useState(0)
  const shown = reduce ? 4 : stage
  const surplus = harvestKg != null && demandKg != null ? Math.max(0, harvestKg - demandKg) : null
  const buyer = surplus != null ? Math.round(surplus * 0.6) : null
  const rescue = surplus != null && buyer != null ? surplus - buyer : null

  useEffect(() => {
    if ((!inView && runId === 0) || reduce) return
    setStage(0)
    const timers = [0, 700, 1400, 2100, 2800].map((ms, index) =>
      window.setTimeout(() => setStage(index), ms),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [inView, reduce, runId])

  return (
    <section id="yield" ref={ref} className="scroll-mt-24 border border-line bg-forest-deep p-5 text-white sm:p-6">
      <p className={`text-[11px] text-white/45 ${kickerClass}`}>{t("dash.surplusKicker")}</p>
      <h2 className="font-display mt-2 text-[clamp(1.4rem,2.4vw,2rem)] leading-snug">
        {t("dash.surplusTitle")}
      </h2>
      <p className="mt-2 text-[12px] text-white/50">{t("dash.userProvidedData")}</p>
      {harvestKg == null || demandKg == null || surplus == null || buyer == null || rescue == null ? (
        <p className="mt-6 text-sm text-white/70">{t("dash.awaitingHarvestPlan")}</p>
      ) : (
        <>
      {showRun ? (
        <button
          type="button"
          className="dash-btn mt-4 border-white/20 bg-white/10 text-white"
          onClick={() => setRunId((value) => value + 1)}
        >
          {t("dash.runPrediction")}
        </button>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-stretch">
        <Metric
          value={formatKg(harvestKg)}
          label={t("dash.predHarvest")}
          show={shown >= 0}
        />
        <Arrow show={shown >= 1} />
        <Metric
          value={formatKg(demandKg)}
          label={t("dash.predDemand")}
          show={shown >= 1}
        />
        <Arrow show={shown >= 2} />
        <Metric
          value={formatKg(surplus)}
          label={t("dash.surplusRisk")}
          show={shown >= 2}
          warn
        />
      </div>

      <motion.div
        initial={false}
        animate={{ opacity: shown >= 3 ? 1 : 0, y: shown >= 3 ? 0 : 8 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 flex flex-col gap-2 md:flex-row"
      >
        <Arrow show={shown >= 3} />
        <Metric
          value={formatKg(buyer)}
          label={t("dash.buyerMatched")}
          show={shown >= 3}
        />
        <span className="self-center text-center text-white/35">+</span>
        <Metric
          value={formatKg(rescue)}
          label={t("dash.rescuePlanned")}
          show={shown >= 3}
        />
      </motion.div>

      <motion.p
        initial={false}
        animate={{ opacity: shown >= 4 ? 1 : 0 }}
        className="mt-4 border border-leaf/30 bg-leaf/10 px-4 py-3 text-sm leading-snug"
      >
        {t("dash.calculatedFromInputs")}
      </motion.p>
        </>
      )}
    </section>
  )
}

function Metric({
  value,
  label,
  show,
  warn = false,
}: {
  value: string
  label: string
  show: boolean
  warn?: boolean
}) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0.25, scale: show ? 1 : 0.98 }}
      transition={{ duration: 0.35 }}
      className={`min-w-0 flex-1 border px-4 py-3 ${warn ? "border-amber/50 bg-amber/10" : "border-white/10"}`}
    >
      <p className={`font-display text-2xl ${warn ? "text-amber" : "text-white"}`}>{value}</p>
      <p className="mt-1 text-[12px] leading-snug text-white/55">{label}</p>
    </motion.div>
  )
}

function Arrow({ show }: { show: boolean }) {
  return (
    <span className={`self-center text-center text-white/40 ${show ? "opacity-100" : "opacity-20"}`} aria-hidden>
      <span className="md:hidden">↓</span>
      <span className="hidden md:inline">→</span>
    </span>
  )
}
