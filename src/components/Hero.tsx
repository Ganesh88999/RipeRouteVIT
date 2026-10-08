import { motion, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"
import {
  demoHarvest,
  formatKg,
  heroNetworkNodes,
  landingImages,
} from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { cinematicEase } from "../motion"
import { AINetwork } from "./AINetwork"
import { CinematicImage } from "./CinematicImage"
import { GoogleSignInButton } from "./GoogleSignInButton"

const lineReveal = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: cinematicEase },
  },
}

export function Hero() {
  const reduce = useReducedMotion()
  const { t, kickerClass } = useTranslation()
  const [active, setActive] = useState(0)
  const [statusOn, setStatusOn] = useState(Boolean(reduce))

  useEffect(() => {
    if (reduce) return
    let interval = 0
    const status = window.setTimeout(() => setStatusOn(true), 720)
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        setActive((value) => (value + 1) % heroNetworkNodes.length)
      }, 1800)
    }, 780)
    return () => {
      window.clearTimeout(status)
      window.clearTimeout(start)
      window.clearInterval(interval)
    }
  }, [reduce])

  const node = heroNetworkNodes[active]

  return (
    <section id="top" className="relative min-h-svh overflow-hidden bg-ink">
      <CinematicImage
        src={landingImages.hero.src}
        alt={landingImages.hero.alt}
        className="absolute inset-0 h-full w-full"
        priority
        overlay="dark"
        drift
        reveal="hero"
      />

      <div className="relative mx-auto grid min-h-svh max-w-6xl items-end gap-10 px-5 pb-16 pt-28 sm:px-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:pb-20 lg:pt-24">
        <motion.div
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
        >
          <motion.p variants={lineReveal} className={`mb-6 text-[11px] font-medium text-white/65 ${kickerClass}`}>
            {t("hero.kicker")}
          </motion.p>
          <h1 className="font-display text-[clamp(2.35rem,6vw,5.1rem)] leading-[1.05] tracking-[-0.04em] text-white">
            <motion.span variants={lineReveal} className="block">
              {t("hero.line1")}
            </motion.span>
            <motion.span variants={lineReveal} className="block">
              {t("hero.line2")}
            </motion.span>
            <motion.span variants={lineReveal} className="block">
              {t("hero.line3")}
            </motion.span>
          </h1>
          <motion.p
            variants={lineReveal}
            className="mt-6 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
          >
            {t("hero.description")}
          </motion.p>
          <motion.div variants={lineReveal} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <GoogleSignInButton variant="on-dark" className="landing-cta px-6 py-3" />
            <a href="#how-it-works" className="landing-cta-outline">
              {t("hero.explore")}
            </a>
          </motion.div>
        </motion.div>

        <motion.aside
          aria-label={t("hero.networkAria")}
          initial={reduce ? false : { opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.55, ease: cinematicEase }}
          className="border border-white/10 bg-forest-deep/18 p-5 backdrop-blur-[6px]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className={`min-w-0 text-[11px] leading-snug text-white/50 ${kickerClass}`}>
              {t("hero.coordinating")}
            </p>
            <motion.span
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={statusOn ? { opacity: 1, y: 0 } : { opacity: 0 }}
              className={`inline-flex min-w-0 items-center gap-2 text-[11px] leading-snug text-leaf ${kickerClass}`}
            >
              <span className="landing-status-dot h-1.5 w-1.5 shrink-0 rounded-full bg-leaf" />
              {t("hero.active")}
            </motion.span>
          </div>

          <AINetwork
            nodes={heroNetworkNodes.map((item) => ({
              id: item.id,
              label: t(`network.${item.id}`),
            }))}
            activeIndex={active}
            status={t(`network.${node.id}Status`)}
            compact
            className="mt-4"
          />

          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div>
              <p className="font-display text-2xl text-white">{formatKg(demoHarvest.expectedKg)}</p>
              <p className={`mt-1 text-[10px] leading-snug text-white/45 ${kickerClass}`}>
                {t("hero.harvest")}
              </p>
            </div>
            <div>
              <p className="font-display text-2xl text-amber">{formatKg(demoHarvest.surplusKg)}</p>
              <p className={`mt-1 text-[10px] leading-snug text-amber/80 ${kickerClass}`}>
                {t("hero.surplusRisk")}
              </p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  )
}
