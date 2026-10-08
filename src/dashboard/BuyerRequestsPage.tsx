import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import { assessFeasibility } from "../lib/feasibility"
import { requestsForFarmer } from "../lib/demandNetwork"
import { FeatureFrame } from "./FeatureFrame"
import { useDemandNetwork } from "./FarmProfileContext"

export function BuyerRequestsPage() {
  const { t } = useTranslation()
  const { farmerProfile, responses, requests: allRequests } = useDemandNetwork()
  const reduce = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(null)

  const matchedRequests = useMemo(
    () => (farmerProfile ? requestsForFarmer(farmerProfile) : []),
    [farmerProfile, responses, allRequests],
  )

  if (!farmerProfile) {
    return (
      <FeatureFrame title={t("dash.navBuyerRequests")} subtitle={t("dash.farmerRoleRequired")}>
        <p className="text-sm text-ink-muted">{t("dash.noFarmProfile")}</p>
      </FeatureFrame>
    )
  }

  return (
    <FeatureFrame title={t("dash.navBuyerRequests")} subtitle={t("dash.requestsSubtitle")}>
      {matchedRequests.length === 0 ? (
        <div className="dash-card p-5">
          <p className="text-sm font-medium">{t("dash.noMatchingBuyerRequests")}</p>
          <p className="mt-2 text-[12px] text-ink-muted">{t("dash.demandWillAppear")}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {matchedRequests.map((req, index) => {
              const mine = responses.find(
                (r) => r.requestId === req.id && r.farmerId === farmerProfile.userId && r.status !== "withdrawn",
              )
              return (
                <motion.li
                  key={req.id}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : index * 0.04 }}
                  className="dash-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold uppercase tracking-wide">{req.crop}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {t("dash.buyerLabel")}: {req.buyerName}
                      </p>
                    </div>
                    <p className="text-sm text-leaf">
                      {t("dash.relevance")} {req.matchScore}%
                    </p>
                  </div>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    <Row label={t("dash.required")} value={formatKg(req.quantityKg - req.filledKg)} />
                    <Row label={t("dash.price")} value={`₹${req.pricePerKg} / KG`} />
                    <Row label={t("dash.delivery")} value={req.locationName} />
                    <Row label={t("dash.neededBy")} value={formatDate(req.neededBy)} />
                    <Row
                      label={t("dash.distance")}
                      value={req.distance != null ? `${req.distance} KM` : t("dash.locationOnFile")}
                    />
                    <Row
                      label={t("dash.cropMatch")}
                      value={`${req.matchScore}% ${t("dash.relevance").toLowerCase()}`}
                    />
                  </dl>
                  {mine ? (
                    <p className="mt-3 text-sm text-leaf">
                      {mine.status === "awaiting_buyer"
                        ? `${t("dash.waitingBuyerConfirm")} · ${t("dash.offered")} ${formatKg(mine.offeredQuantityKg)}`
                        : mine.status === "accepted"
                          ? t("dash.offerAcceptedLinks")
                          : mine.status === "counter"
                            ? t("dash.counterOfferReceived")
                            : mine.status}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="dash-btn dash-btn-primary mt-4"
                    onClick={() => setOpenId(openId === req.id ? null : req.id)}
                  >
                    {t("dash.checkFeasibility")}
                  </button>
                  {openId === req.id ? (
                    <FeasibilityPanel requestId={req.id} onSubmitted={() => setOpenId(null)} />
                  ) : null}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
      <Link to="/buyer-links" className="dash-btn mt-5 inline-flex text-[12px]">
        {t("dash.myBuyerLinks")}
      </Link>
    </FeatureFrame>
  )
}

function FeasibilityPanel({
  requestId,
  onSubmitted,
}: {
  requestId: string
  onSubmitted: () => void
}) {
  const { t } = useTranslation()
  const { farmerProfile, requests, offerResponse } = useDemandNetwork()
  const reduce = useReducedMotion()
  const request = requests.find((r) => r.id === requestId)
  const result = farmerProfile && request ? assessFeasibility(farmerProfile, request) : null
  const daysOut =
    request != null
      ? Math.max(7, Math.round((new Date(request.neededBy).getTime() - Date.now()) / 86400000) || 18)
      : 18
  const [offerQty, setOfferQty] = useState(() =>
    result ? String(result.feasibleKg || result.requestedKg || 1000) : "1000",
  )
  const [offerPrice, setOfferPrice] = useState(() => String(request?.pricePerKg ?? 28))
  const [offerDate, setOfferDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + daysOut)
    return d.toISOString().slice(0, 10)
  })
  const [error, setError] = useState<string | null>(null)

  if (!farmerProfile || !request || !result) return null

  function submitOffer(overrides?: { qty?: number; price?: number; date?: string }) {
    if (!farmerProfile || !request) return
    const qty = overrides?.qty ?? Number(offerQty)
    const price = overrides?.price ?? Number(offerPrice)
    const date = overrides?.date ?? offerDate
    if (!Number.isFinite(qty) || qty <= 0) {
      setError(t("dash.enterValidOfferQty"))
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setError(t("dash.enterValidPrice"))
      return
    }
    if (!date) {
      setError(t("dash.enterExpectedDelivery"))
      return
    }
    setError(null)
    offerResponse({
      requestId: request.id,
      farmerId: farmerProfile.userId,
      farmerLabel: farmerProfile.displayName || farmerProfile.locationName || "Farm",
      offeredQuantityKg: qty,
      pricePerKg: price,
      expectedHarvestDate: date,
    })
    onSubmitted()
  }

  const title =
    result.kind === "full"
      ? t("dash.fullMatchPossible")
      : result.kind === "partial"
        ? t("dash.partialMatchWarn")
        : t("dash.fullRequestNotFeasible")

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-4 border-t border-line pt-4"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-[12px] text-ink-muted">
        {t("dash.buyerWants")} {formatKg(result.requestedKg)} · {t("dash.delivery")}: {request.locationName}
      </p>
      <div className="mt-4 space-y-2 text-sm">
        <FlowLine
          from={`${formatKg(result.requestedKg)} ${t("dash.requested")}`}
          to={`${formatKg(result.expectedAvailableKg)} ${t("dash.estimatedAvailable")}`}
        />
        <FlowLine
          from={`${formatKg(result.feasibleKg)} ${t("dash.suggestedOffer")}`}
          to={
            result.kind === "full"
              ? `${formatKg(result.bufferKg)} ${t("dash.buffer")}`
              : `${formatKg(result.shortfallKg)} ${t("dash.shortfall")}`
          }
        />
      </div>
      <p className="mt-3 text-sm text-ink-muted">{result.recommendation}</p>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <label>
          <span className="text-ink-muted">{t("dash.offerQuantityKg")}</span>
          <input
            value={offerQty}
            onChange={(e) => setOfferQty(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
          />
        </label>
        <label>
          <span className="text-ink-muted">{t("dash.pricePerKgShort")}</span>
          <input
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
          />
        </label>
        <label>
          <span className="text-ink-muted">{t("dash.expectedDelivery")}</span>
          <input
            type="date"
            value={offerDate}
            onChange={(e) => setOfferDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-line px-2 py-1.5"
          />
        </label>
      </div>
      {error ? <p className="mt-2 text-sm text-urgent">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="dash-btn dash-btn-primary" onClick={() => submitOffer()}>
          {t("dash.submitOffer")}
        </button>
        {result.kind === "full" ? (
          <button
            type="button"
            className="dash-btn"
            onClick={() => submitOffer({ qty: result.requestedKg })}
          >
            {t("dash.offerFull")} {formatKg(result.requestedKg)}
          </button>
        ) : null}
        <button type="button" className="dash-btn" onClick={onSubmitted}>
          {t("dash.decline")}
        </button>
      </div>
    </motion.div>
  )
}

function FlowLine({ from, to }: { from: string; to: string }) {
  return (
    <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex flex-wrap items-center gap-2">
      <span className="rounded-md bg-canvas-warm px-2 py-1">{from}</span>
      <span className="text-ink-muted">↓</span>
      <span className="rounded-md bg-canvas-warm px-2 py-1">{to}</span>
    </motion.div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-1.5">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString()
  } catch {
    return iso
  }
}
