import { Bell, ChevronDown, Menu, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import { LanguageSwitcher } from "../components/LanguageSwitcher"
import { farmProfile } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"
import { operatorName } from "./operator"
import { UserAvatar } from "./UserAvatar"

export function DashTopbar({ onMenu }: { onMenu: () => void }) {
  const { user, signOut } = useAuth()
  const { t, kickerClass } = useTranslation()
  const navigate = useNavigate()
  const [notesOpen, setNotesOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const name = operatorName(user, t("dash.farmer"))
  const email = user?.email?.trim() || ""

  const alerts = useMemo(
    () => [
      { text: t("dash.alertHigh"), to: "/yield-surplus" },
      { text: t("dash.alertMed"), to: "/logistics" },
      { text: t("dash.alertLow"), to: "/irrigation" },
    ],
    [t],
  )

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-md">
      <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5">
        <button
          type="button"
          className="dash-btn inline-flex h-9 w-9 items-center justify-center p-0"
          onClick={onMenu}
          aria-label={t("nav.menu")}
        >
          <Menu className="h-4 w-4" />
        </button>

        <Link
          to="/farm-advisor"
          className="dash-btn hidden min-w-0 items-center gap-2 px-2.5 py-1.5 text-left sm:flex"
        >
          <span className="text-sm">🌱</span>
          <span className="min-w-0">
            <span className={`block text-[9px] text-amber ${kickerClass}`}>{t("dash.demoFarm")}</span>
            <span className="block truncate text-[13px] font-medium">{farmProfile.farm}</span>
            <span className="block truncate text-[11px] text-ink-muted">{farmProfile.region}</span>
          </span>
        </Link>

        <form
          className="hidden min-w-0 flex-1 md:block"
          onSubmit={(event) => {
            event.preventDefault()
            navigate("/buyer-matching")
          }}
        >
          <label className="relative block">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
            <input
              type="search"
              placeholder={t("dash.searchPh")}
              className="w-full rounded-full border border-line bg-card py-2 pr-3 pl-9 text-sm outline-none focus:border-forest"
            />
          </label>
        </form>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 xl:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf dash-pulse" />
            <span className={`text-[10px] text-forest ${kickerClass}`}>{t("hero.active")}</span>
            <span className="text-[11px] text-ink-muted">{t("hero.coordinating")}</span>
          </div>

          <div className="relative">
            <button
              type="button"
              className="dash-btn inline-flex h-9 w-9 items-center justify-center p-0"
              aria-label={t("dash.notifications")}
              onClick={() => setNotesOpen((value) => !value)}
            >
              <Bell className="h-4 w-4" />
            </button>
            {notesOpen ? (
              <ul className="absolute right-0 mt-2 w-72 border border-line bg-card p-2 shadow-lg">
                {alerts.map((alert) => (
                  <li key={alert.to} className="border-b border-line last:border-0">
                    <Link
                      to={alert.to}
                      className="block px-2 py-2 text-[12px] hover:bg-canvas-warm"
                      onClick={() => setNotesOpen(false)}
                    >
                      {alert.text}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <LanguageSwitcher tone="on-light" />

          <div className="relative">
            <button
              type="button"
              className="dash-btn flex min-w-0 items-center gap-2 px-1.5 py-1"
              onClick={() => setMenuOpen((value) => !value)}
            >
              <UserAvatar photoURL={user?.photoURL} name={name} />
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-[9rem] truncate text-[13px] font-medium">{name}</span>
                <span className="block max-w-[9rem] truncate text-[11px] text-ink-muted">
                  {t("dash.demoFarm")} · {farmProfile.region}
                </span>
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-ink-muted sm:block" />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-64 border border-line bg-card p-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <UserAvatar photoURL={user?.photoURL} name={name} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{name}</p>
                    {email ? <p className="truncate text-[12px] text-ink-muted">{email}</p> : null}
                  </div>
                </div>
                <Link
                  to="/settings"
                  className="dash-btn mt-3 flex w-full justify-center text-[12px]"
                  onClick={() => setMenuOpen(false)}
                >
                  {t("dash.settings")}
                </Link>
                <button
                  type="button"
                  className="dash-btn mt-2 w-full text-[12px]"
                  onClick={() => {
                    void signOut()
                  }}
                >
                  {t("dash.signOut")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
