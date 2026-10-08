import { motion, useReducedMotion } from "framer-motion"
import { useTranslation } from "../i18n/LanguageProvider"
import { cinematicEase } from "../motion"

export function OpsHero() {
  const { t, kickerClass } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section id="overview" className="scroll-mt-24 border-b border-line bg-forest-deep px-4 py-8 text-white sm:px-6">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("hero.active")}</p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: cinematicEase }}
            className="font-display mt-2 text-[clamp(1.7rem,3.2vw,2.6rem)] leading-snug"
          >
            {t("dash.heroTitle")}
          </motion.h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
            {t("dash.heroSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusChip label={t("hero.coordinating")} />
          <StatusChip label={`${t("dash.system")}: ${t("dash.operational")}`} live />
        </div>
      </div>
    </section>
  )
}

function StatusChip({ label, live = false }: { label: string; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] leading-snug text-white/80">
      {live ? <span className="h-1.5 w-1.5 rounded-full bg-leaf" /> : null}
      {label}
    </span>
  )
}
