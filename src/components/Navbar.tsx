import { Menu, Sprout, X } from "lucide-react"
import { AnimatePresence, motion, useScroll } from "framer-motion"
import { useEffect, useState } from "react"
import { navLinks } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { GoogleSignInButton } from "./GoogleSignInButton"
import { LanguageSwitcher } from "./LanguageSwitcher"

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const { scrollY } = useScroll()
  const { t } = useTranslation()

  useEffect(() => {
    return scrollY.on("change", (value) => {
      setSolid(value > 24)
    })
  }, [scrollY])

  return (
    <motion.header
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border-color] duration-300 ${
        solid
          ? "border-b border-white/10 bg-forest-deep/88 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.55)] backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 sm:px-8 ${
          solid ? "py-2.5" : "py-4"
        }`}
      >
        <a href="#top" className="flex min-w-0 items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10">
            <Sprout className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <span className="truncate text-sm font-semibold tracking-[0.18em] uppercase">
            RipeRoute
          </span>
        </a>

        <ul className="hidden min-w-0 flex-1 items-center justify-end gap-x-4 gap-y-1 lg:flex xl:gap-x-6">
          {navLinks.map((link) => (
            <li key={link.href} className="min-w-0">
              <a
                href={link.href}
                className="relative text-[13px] leading-snug text-white/70 transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-white after:transition-[width] after:duration-300 hover:text-white hover:after:w-full focus-visible:text-white focus-visible:outline-none"
              >
                {t(link.key)}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <GoogleSignInButton
              variant="on-dark"
              className="landing-cta px-3.5 py-2 text-[13px]"
            />
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            <span className="sr-only">{t("nav.menu")}</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-forest-deep lg:hidden"
          >
            <ul className="flex flex-col gap-1 px-5 py-4">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="block py-2 text-sm leading-snug text-white/80"
                    onClick={() => setOpen(false)}
                  >
                    {t(link.key)}
                  </a>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-5 sm:hidden">
              <GoogleSignInButton variant="on-dark" className="landing-cta w-full" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  )
}
