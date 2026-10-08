import { motion, useReducedMotion } from "framer-motion"
import { Link } from "react-router-dom"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import {
  remainingSurplusForFarmer,
  updateLinkDeliveryStatus,
  type FarmBuyerLink,
} from "../lib/demandNetwork"
import { FeatureFrame } from "./FeatureFrame"
import { useDemandNetwork } from "./FarmProfileContext"

const DELIVERY_STAGES: NonNullable<FarmBuyerLink["deliveryStatus"]>[] = [
  "confirmed",
  "preparing",
  "dispatched",
  "in_transit",
  "delivered",
]

function stageLabelKey(status: FarmBuyerLink["deliveryStatus"]): string {
  switch (status) {
    case "preparing":
      return "dash.statusPreparing"
    case "dispatched":
      return "dash.statusDispatched"
    case "in_transit":
      return "dash.statusInTransit"
    case "delivered":
      return "dash.statusDelivered"
    case "confirmed":
    default:
      return "dash.statusConfirmed"
  }
}

export function BuyerLinksPage() {
  const { t } = useTranslation()
  const { farmerProfile, buyerProfile, links, role } = useDemandNetwork()
  const reduce = useReducedMotion()
  const mine =
    role === "farmer"
      ? links.filter((l) => l.farmerId === farmerProfile?.userId)
      : links.filter((l) => l.buyerId === buyerProfile?.userId)

  const title = role === "buyer" ? t("dash.navFarmLinks") : t("dash.navBuyerLinks")
  const surplus = farmerProfile ? remainingSurplusForFarmer(farmerProfile) : 0

  return (
    <FeatureFrame title={title} subtitle={t("dash.buyerNetwork")}>
      {mine.length === 0 ? (
        <div className="dash-card p-5">
          <p className="text-sm">
            {role === "buyer" ? t("dash.noActiveFarmLinks") : t("dash.emptyBuyers")}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {mine.map((link, index) => (
            <motion.li
              key={link.id}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : index * 0.04 }}
              className="dash-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold uppercase">{link.crop}</p>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-leaf">
                  <span className="h-1.5 w-1.5 rounded-full bg-leaf dash-pulse" />
                  {link.status.toUpperCase()}
                </span>
              </div>
              <p className="mt-2 text-sm">
                {formatKg(link.agreedQuantityKg)} · ₹{link.agreedPricePerKg}
                {t("dash.perKg")}
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {role === "farmer"
                  ? `${t("dash.buyer")}: ${link.buyerName}`
                  : `${t("dash.farmer")}: ${link.farmerLabel}`}{" "}
                · {t(stageLabelKey(link.deliveryStatus))} · {link.expectedHarvestDate}
              </p>
              <Link
                to={role === "buyer" ? `/buyer-dashboard/farm-links/${link.id}` : `/buyer-links/${link.id}`}
                className="dash-btn mt-3 inline-flex text-[12px]"
              >
                {t("dash.viewDetails")}
              </Link>
            </motion.li>
          ))}
        </ul>
      )}

      {role === "farmer" && surplus > 0 ? (
        <div className="mt-6 dash-card p-4">
          <p className="text-sm font-medium">
            {t("dash.remaining")}: {formatKg(surplus)}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/food-rescue" className="dash-btn">
              ♻ {t("dash.rescueTitle")}
            </Link>
            <Link to="/food-rescue" className="dash-btn">
              ❤️ {t("dash.donation")}
            </Link>
            <Link to="/food-rescue" className="dash-btn">
              🏭 {t("dash.processing")}
            </Link>
            <Link to="/buyer-requests" className="dash-btn dash-btn-primary">
              🛒 {t("dash.findBuyers")}
            </Link>
          </div>
        </div>
      ) : null}
    </FeatureFrame>
  )
}

export function BuyerLinkDetailPage({ linkId }: { linkId: string }) {
  const { t } = useTranslation()
  const { links, requests, refreshNetwork, role } = useDemandNetwork()
  const link = links.find((l) => l.id === linkId)
  if (!link) {
    return (
      <div className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6">
        <p className="text-sm text-ink-muted">{t("dash.locationNotFound")}</p>
      </div>
    )
  }

  const request = requests.find((r) => r.id === link.requestId)
  const remaining =
    request != null ? Math.max(0, request.quantityKg - request.filledKg) : null
  const buyerPhone = link.buyerMobile || t("dash.awaitingFarmData")
  const farmerPhone = link.farmerMobile || t("dash.awaitingFarmData")
  const stage = link.deliveryStatus || "confirmed"

  return (
    <div className="mx-auto max-w-[1100px] space-y-2 px-4 py-5 text-sm sm:px-6">
      <h1 className="font-display text-2xl">{t("dash.buyerNavLinks")}</h1>
      <div className="dash-card mt-4 space-y-2 p-5">
        <p>
          {t("dash.farmer")}: {link.farmerLabel}
        </p>
        <p>
          {t("dash.buyer")}: {link.buyerName}
        </p>
        <p>
          {t("dash.crop")}: {link.crop}
        </p>
        <p>
          {t("dash.quantityKg")}: {formatKg(link.agreedQuantityKg)}
        </p>
        <p>
          {t("dash.pricePerKg")}: ₹{link.agreedPricePerKg}
          {t("dash.perKg")}
        </p>
        <p>
          {t("dash.expectedHarvest")}: {link.expectedHarvestDate}
        </p>
        <p>
          {t("dash.deliveryLocation")}: {link.locationName}
        </p>
        {link.distanceKm != null ? (
          <p>
            {t("dash.distance")}: {link.distanceKm} KM
          </p>
        ) : null}
        <p>
          {t("dash.eligibility")}: {link.status.toUpperCase()}
        </p>
        <p>
          {t("dash.trackDelivery")}: {t(stageLabelKey(stage))}
        </p>
        {request ? (
          <p className="text-ink-muted">
            {t("dash.remaining")}: {formatKg(request.filledKg)} / {formatKg(request.quantityKg)}
            {remaining != null && remaining > 0 ? ` · ${formatKg(remaining)} ${t("dash.remaining")}` : ""}
          </p>
        ) : null}

        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] tracking-[0.14em] uppercase text-leaf">{t("dash.coordTitle")}</p>
          <p className="mt-2">
            {t("dash.farmer")}: <span className="font-medium">{farmerPhone}</span>
          </p>
          <p className="mt-1">
            {t("dash.buyer")}: <span className="font-medium">{buyerPhone}</span>
          </p>
          <p className="mt-2 text-[12px] text-ink-muted">{t("dash.mobileHelpBuyer")}</p>
        </div>

        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] tracking-[0.14em] uppercase text-leaf">{t("dash.trackDelivery")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DELIVERY_STAGES.map((s) => (
              <button
                key={s}
                type="button"
                className={`dash-btn text-[12px] ${stage === s ? "dash-btn-primary" : ""}`}
                onClick={() => {
                  updateLinkDeliveryStatus(link.id, s)
                  refreshNetwork()
                }}
              >
                {t(stageLabelKey(s))}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[12px] text-ink-muted">{t("dash.deliveryStagesHint")}</p>
        </div>

        {role === "buyer" && remaining != null && remaining > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/buyer-dashboard/farmers" className="dash-btn dash-btn-primary">
              {t("dash.buyerNavNearby")}
            </Link>
            <Link to="/buyer-dashboard/create-demand" className="dash-btn">
              {t("dash.buyerNavCreateDemand")}
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  )
}
