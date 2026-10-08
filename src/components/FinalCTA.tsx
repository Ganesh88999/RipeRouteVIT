import { motion, useReducedMotion } from "framer-motion"
import { landingImages } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { CinematicImage } from "./CinematicImage"
import { GoogleSignInButton } from "./GoogleSignInButton"

export function FinalCTA() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section className="relative min-h-[80svh] overflow-hidden bg-ink">
      <CinematicImage
        src={landingImages.cta.src}
        alt={landingImages.cta.alt}
        className="absolute inset-0 h-full w-full"
        overlay="dark"
        drift
        reveal="hero"
        clipReveal
      />
      <div className="relative mx-auto flex min-h-[80svh] max-w-4xl flex-col items-center justify-center px-5 py-24 text-center sm:px-8">
        <motion.h2
          initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(1.85rem,4.8vw,4.5rem)] leading-[1.18] text-white"
        >
          {t("cta.title")}
          <span className="mt-3 block text-white/75">{t("cta.subtitle")}</span>
        </motion.h2>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center"
        >
          <GoogleSignInButton variant="on-dark" className="landing-cta px-8 py-3.5" />
          <a href="#ai-network" className="landing-cta-outline">
            {t("cta.explore")}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
