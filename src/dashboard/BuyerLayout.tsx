import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Sprout, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { NavLink, Outlet, useLocation } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"
import { DashTopbar } from "./DashboardHeader"
import { DemoNoticeProvider, useDemoNotice } from "./DemoNotice"
import { buyerNavGroups } from "./buyerNav"

function BuyerSidebar({
  collapsed,
  onClose,
}: {
  collapsed: boolean
  onClose?: () => void
}) {
  const { kickerClass, t } = useTranslation()

  return (
    <aside
      className={`flex h-full flex-col border-r border-line bg-forest-deep text-white ${
        collapsed ? "w-[4.5rem]" : "w-[16.75rem]"
      }`}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-4">
        <NavLink to="/buyer-dashboard" className="flex min-w-0 items-center gap-2 text-white">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/10">
            <Sprout className="h-4 w-4" strokeWidth={1.7} />
          </span>
          {collapsed ? null : (
            <div className="min-w-0">
              <p className="truncate text-[12px] font-medium tracking-[0.16em] uppercase">RipeRoute</p>
              <p className={`mt-0.5 truncate text-[9px] text-white/45 ${kickerClass}`}>
                {t("dash.buyerCommand")}
              </p>
            </div>
          )}
        </NavLink>
        {onClose ? (
          <button type="button" className="lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-6">
        {buyerNavGroups.map((group) => (
          <div key={group.labelKey} className="mb-4">
            {collapsed ? null : (
              <p className={`px-2 pb-1 text-[9px] text-white/35 ${kickerClass}`}>{t(group.labelKey)}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const label = t(item.labelKey)
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      title={label}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[13px] transition-colors ${
                          isActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-leaf" : ""}`} strokeWidth={1.7} />
                          {collapsed ? null : <span className="min-w-0 leading-snug">{label}</span>}
                        </>
                      )}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function NoticeBanner() {
  const { message } = useDemoNotice()
  if (!message) return null
  return <div className="border-b border-leaf/30 bg-leaf/10 px-4 py-2 text-[12px] text-forest">{message}</div>
}

export function BuyerLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduce = useReducedMotion()
  const location = useLocation()

  return (
    <DemoNoticeProvider>
      <div className="command-center flex min-h-svh overflow-x-hidden bg-canvas text-ink">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-svh">
            <BuyerSidebar collapsed={collapsed} />
          </div>
        </div>

        {mobileOpen ? (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Close" onClick={() => setMobileOpen(false)} />
            <div className="relative h-full w-[16.75rem]">
              <BuyerSidebar collapsed={false} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <DashTopbar
            onMenu={() => {
              if (window.matchMedia("(min-width: 1024px)").matches) {
                setCollapsed((value) => !value)
              } else {
                setMobileOpen(true)
              }
            }}
          />
          <NoticeBanner />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="min-w-0 flex-1"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DemoNoticeProvider>
  )
}

export function BuyerPageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6 sm:py-5">{children}</div>
}
