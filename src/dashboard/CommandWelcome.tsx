import { Wheat, CircleAlert, HeartHandshake, Handshake } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { useAuth } from "../auth/auth-context"
import { cinematicEase } from "../motion"
import { remainingSurplusForFarmer } from "../lib/demandNetwork"
import { useFarmProfile, useDemandNetwork } from "./FarmProfileContext"
import { useLiveFarm } from "./liveFarm"
import { operatorFirstName } from "./operator"

function greetingKey() {
  const hour = new Date().getHours()
  if (hour < 12) return "dash.goodMorning"
  if (hour < 17) return "dash.goodAfternoon"
  return "dash.goodEvening"
}

export function CommandWelcome() {
  const { t, kickerClass } = useTranslation()
  const { user } = useAuth()
  const { harvestKg, demandKg } = useLiveFarm()
  const { profile, selectedCrop } = useFarmProfile()
  const { farmerProfile, links } = useDemandNetwork()
  const reduce = useReducedMotion()
  const first = operatorFirstName(user, t("dash.farmer"))
  const surplus = harvestKg != null && demandKg != null ? Math.max(0, harvestKg - demandKg) : null
  const remaining =
    farmerProfile != null ? remainingSurplusForFarmer(farmerProfile) : null
  const activeLinks = links.filter(
    (l) => l.farmerId === farmerProfile?.userId && l.status === "active",
  ).length

  const stats = [
    {
      icon: Wheat,
      label: t("dash.expectedHarvest"),
      value: farmerProfile?.expectedHarvestKg ?? harvestKg,
      context: t("dash.userProvidedData"),
      to: "/production-planner",
    },
    {
      icon: Handshake,
      label: "Active buyer links",
      value: activeLinks > 0 ? activeLinks : null,
      context: activeLinks > 0 ? "Confirmed agreements" : t("dash.awaitingFarmData"),
      to: "/buyer-links",
      asCount: true,
    },
    {
      icon: CircleAlert,
      label: "Remaining surplus",
      value: remaining != null && remaining > 0 ? remaining : surplus,
      context: remaining != null && remaining > 0 ? "After buyer commitments" : t("dash.calculatedFromInputs"),
      to: "/buyer-links",
    },
    {
      icon: HeartHandshake,
      label: t("dash.foodRescued"),
      value: null as number | null,
      context: t("dash.awaitingFarmData"),
      to: "/food-rescue",
    },
  ]

  return (
    <section id="overview" className="scroll-mt-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: cinematicEase }}
            className="font-display text-[clamp(1.35rem,2.4vw,1.85rem)] leading-snug text-ink"
          >
            {t(greetingKey())}, {first}.
          </motion.h1>
          <p className="mt-1 max-w-xl text-sm text-ink-muted">{t("dash.greetingSub")}</p>
          {selectedCrop ? (
            <p className="mt-2 text-[12px] text-forest">
              Active crop: <span className="font-medium">{selectedCrop}</span>
              {profile?.locationName ? ` · ${profile.locationName}` : ""}
            </p>
          ) : null}
          <p className="mt-3 inline-flex flex-wrap items-center gap-2 text-[11px] text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-leaf dash-pulse" />
            <span className={kickerClass}>{t("hero.active")}</span>
            <span className="text-ink-muted">{t("hero.coordinating")}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/buyer-requests" className="dash-btn dash-btn-primary">
            Buyer Requests
          </Link>
          <Link to="/production-planner" className="dash-btn">
            What Should I Grow?
          </Link>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link to={stat.to} key={stat.label} className="dash-card dash-card-hover block p-4">
              <Icon className="h-4 w-4 text-forest" strokeWidth={1.7} />
              <p className="font-display mt-2 text-2xl text-ink">
                {stat.value == null
                  ? t("dash.awaitingFarmData")
                  : "asCount" in stat && stat.asCount
                    ? String(stat.value)
                    : formatKg(stat.value)}
              </p>
              <p className="mt-1 text-[12px] font-medium">{stat.label}</p>
              <p className="mt-1 text-[11px] text-ink-muted">{stat.context}</p>
              <p className="mt-2 text-[12px] text-forest">{t("dash.viewDetails")}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
