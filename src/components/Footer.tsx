import { ArrowRight, ArrowUp, Sprout } from "lucide-react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { navLinks, sdgs } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"

export function Footer() {
  const { t, kickerClass } = useTranslation()

  return (
    <footer className="relative overflow-hidden bg-[#0c241c] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-10 sm:px-8 lg:pt-20">
        <div className="flex justify-end">
          <button
            type="button"
            aria-label={t("footer.backToTop")}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="landing-cta inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white hover:border-[#3dcc7a] hover:text-[#3dcc7a] focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#3dcc7a]"
          >
            <ArrowUp className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 grid gap-12 border-t border-white/10 pt-14 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/15 bg-white/10">
                <Sprout className="h-4 w-4" strokeWidth={1.7} />
              </span>
              <span className="text-sm font-medium tracking-[0.2em] uppercase">RipeRoute</span>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              {t("footer.tagline")}
            </p>
            <p className={`mt-8 text-[11px] text-white/40 ${kickerClass}`}>
              {t("footer.newsletter")}
            </p>
            <div className="mt-3 flex max-w-xs items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1.5">
              <label className="sr-only" htmlFor="landing-footer-email">
                {t("footer.email")}
              </label>
              <input
                id="landing-footer-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder={t("footer.email")}
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
              />
              <button
                type="button"
                className="landing-cta inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3dcc7a] text-[#0c241c]"
                aria-label={t("footer.email")}
              >
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>

          <nav aria-label={t("footer.menu")}>
            <p className={`text-[11px] text-[#3dcc7a] ${kickerClass}`}>{t("footer.menu")}</p>
            <ul className="mt-5 flex flex-col gap-3">
              <li>
                <a
                  href="#top"
                  className="landing-footer-link"
                >
                  {t("footer.home")}
                </a>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="landing-footer-link"
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/dashboard"
                  className="landing-footer-link"
                >
                  {t("footer.dashboard")}
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className={`text-[11px] text-[#3dcc7a] ${kickerClass}`}>{t("coordSection.active")}</p>
            <p className="mt-5 text-sm leading-relaxed text-white/55">
              {t("hero.coordinating")}
            </p>
            <ul className="mt-8 flex gap-5 text-xs tracking-wide text-white/40">
              {sdgs.map((sdg) => (
                <li key={sdg.code}>{sdg.code}</li>
              ))}
            </ul>
          </div>

          <div className="text-sm leading-relaxed text-white/45">
            <p>{t("impact.note")}</p>
          </div>
        </motion.div>

        <div className="mt-16 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>RipeRoute</p>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t("footer.tagline")}
          </motion.p>
        </div>
      </div>
    </footer>
  )
}
