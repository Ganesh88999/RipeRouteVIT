import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import { formatKg } from "../data/landingPageData"
import { requestStatusLabel } from "../lib/demandNetwork"
import { distanceKm, listFarms } from "../lib/userProfile"
import { useTranslation } from "../i18n/LanguageProvider"
import { BuyerPageShell } from "./BuyerLayout"
import { useDemandNetwork } from "./FarmProfileContext"

function greetingKey() {
  const h = new Date().getHours()
  if (h < 12) return "dash.goodMorning"
  if (h < 17) return "dash.goodAfternoon"
  return "dash.goodEvening"
}

function deliveryStatusKey(status: string | undefined) {
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

export function BuyerDashboardHome() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { buyerProfile, requests, responses, links } = useDemandNetwork()
  const reduce = useReducedMotion()

  const myRequests = useMemo(
    () => requests.filter((r) => r.buyerId === buyerProfile?.userId),
    [requests, buyerProfile?.userId],
  )
  const myRequestIds = new Set(myRequests.map((r) => r.id))
  const pendingOffers = responses.filter(
    (r) => myRequestIds.has(r.requestId) && (r.status === "awaiting_buyer" || r.status === "counter"),
  )
  const myLinks = links.filter((l) => l.buyerId === buyerProfile?.userId && l.status === "active")

  const nearbyFarms = useMemo(() => {
    if (!buyerProfile) return []
    return listFarms()
      .map((f) => ({ ...f, distance: distanceKm(buyerProfile, f) }))
      .filter((f) => f.distance <= 120)
      .sort((a, b) => a.distance - b.distance)
  }, [buyerProfile])

  const name = buyerProfile?.businessName || user?.displayName || t("dash.buyer")

  const kpis = [
    {
      label: t("dash.buyerNavMyDemands"),
      value: myRequests.filter((r) => r.status !== "closed" && r.status !== "filled").length,
    },
    { label: t("dash.buyerNavNearby"), value: nearbyFarms.length },
    { label: t("dash.buyerNavResponses"), value: pendingOffers.length },
    { label: t("dash.buyerNavLinks"), value: myLinks.length },
  ]

  return (
    <BuyerPageShell>
      <motion.section initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="h-12 w-12 rounded-full border border-line object-cover" />
          ) : null}
          <div>
            <h1 className="font-display text-[clamp(1.35rem,2.4vw,1.85rem)]">
              {t(greetingKey())}, {name}.
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted">{t("dash.roleBuyerBody")}</p>
            {user?.email ? <p className="mt-1 text-[12px] text-ink-muted">{user.email}</p> : null}
            <p className="mt-1 text-[12px] text-ink-muted">
              {buyerProfile?.locationName} · {buyerProfile?.buyerType}
            </p>
          </div>
        </div>
      </motion.section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.05 * i }}
            className="dash-card p-4"
          >
            <p className="font-display text-2xl">{kpi.value}</p>
            <p className="mt-1 text-[12px] text-ink-muted">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/buyer-dashboard/create-demand" className="dash-btn dash-btn-primary">
          + {t("dash.buyerNavCreateDemand")}
        </Link>
        <Link to="/buyer-dashboard/responses" className="dash-btn">
          {t("dash.buyerNavResponses")}
        </Link>
        <Link to="/buyer-dashboard/farm-links" className="dash-btn">
          {t("dash.buyerNavLinks")}
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-medium">{t("dash.buyerNavMyDemands")}</h2>
        {myRequests.length === 0 ? (
          <div className="mt-3 dash-card p-5">
            <p className="text-sm">{t("dash.noActiveDemands")}</p>
            <p className="mt-1 text-[12px] text-ink-muted">{t("dash.createFirstDemand")}</p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {myRequests.slice(0, 5).map((r, index) => {
              const count = responses.filter((x) => x.requestId === r.id && x.status !== "withdrawn").length
              return (
                <motion.li
                  key={r.id}
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : index * 0.04 }}
                  className="dash-card p-4 text-sm"
                >
                  <p className="font-medium">
                    {r.crop} · {formatKg(r.quantityKg)} · ₹{r.pricePerKg}
                    {t("dash.perKg")}
                  </p>
                  <p className="mt-1 text-[12px] text-ink-muted">
                    {t("dash.neededByDate")} {new Date(r.neededBy).toLocaleDateString()} ·{" "}
                    {requestStatusLabel(r.status)} · {formatKg(r.filledKg)} / {formatKg(r.quantityKg)} · {count}{" "}
                    {t("dash.buyerNavResponses")}
                  </p>
                  <Link to="/buyer-dashboard/responses" className="dash-btn mt-3 inline-flex text-[12px]">
                    {t("dash.viewResponses")}
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">{t("dash.buyerNavMatches")}</h2>
          <Link to="/buyer-dashboard/farmers" className="dash-btn text-[12px]">
            {t("dash.viewAll")}
          </Link>
        </div>
        {nearbyFarms.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">{t("dash.noSuitableFarmers")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {nearbyFarms.slice(0, 4).map((f, index) => (
              <motion.li
                key={f.farmerId}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduce ? 0 : 0.05 * index }}
                className="dash-card flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
              >
                <span>
                  {f.crop} ·{" "}
                  {f.expectedHarvestKg != null ? formatKg(f.expectedHarvestKg) : t("dash.expectedHarvest")}
                </span>
                <span className="text-ink-muted">
                  {f.locationName} · {f.distance} KM {t("dash.distance")}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </BuyerPageShell>
  )
}

export function BuyerCreateDemandPage() {
  const { t } = useTranslation()
  const { buyerProfile, publishRequest } = useDemandNetwork()
  const navigate = useNavigate()
  const [crop, setCrop] = useState(buyerProfile?.preferredCrops[0] || "Tomato")
  const [qty, setQty] = useState(String(buyerProfile?.typicalQuantityKg || 1500))
  const [price, setPrice] = useState("28")
  const [neededBy, setNeededBy] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 20)
    return d.toISOString().slice(0, 10)
  })
  const [notes, setNotes] = useState("")
  const [radius, setRadius] = useState("80")
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (!buyerProfile) {
    return (
      <BuyerPageShell>
        <p className="text-sm">{t("dash.buyerProfileTitle")}</p>
      </BuyerPageShell>
    )
  }

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavCreateDemand")}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t("dash.publishDemandHint")}</p>

      {done ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 dash-card border-forest p-5">
          <p className="text-sm font-medium text-leaf">{t("dash.requestPublished")}</p>
          <p className="mt-2 text-sm">{t("dash.matchingFarms")}</p>
          <button type="button" className="dash-btn dash-btn-primary mt-4" onClick={() => navigate("/buyer-dashboard/requests")}>
            {t("dash.viewMyRequests")}
          </button>
        </motion.div>
      ) : (
        <form
          className="mt-5 grid max-w-lg gap-3 text-sm"
          onSubmit={(e) => {
            e.preventDefault()
            setBusy(true)
            const created = publishRequest({
              buyerId: buyerProfile.userId,
              buyerName: buyerProfile.businessName,
              crop,
              quantityKg: Number(qty) || 0,
              pricePerKg: Number(price) || 0,
              neededBy,
              locationName: buyerProfile.locationName,
              latitude: buyerProfile.latitude,
              longitude: buyerProfile.longitude,
              qualityNotes: notes,
              radiusKm: Number(radius) || null,
              notes,
            })
            console.log("[RIPE BUYER] request published", created.id)
            setBusy(false)
            setDone(true)
          }}
        >
          <label>
            {t("dash.crop")}
            <input value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" required />
          </label>
          <label>
            {t("dash.quantityKg")}
            <input value={qty} onChange={(e) => setQty(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" required />
          </label>
          <label>
            {t("dash.pricePerKg")}
            <input value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" required />
          </label>
          <label>
            {t("dash.neededByDate")}
            <input type="date" value={neededBy} onChange={(e) => setNeededBy(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" required />
          </label>
          <label>
            {t("dash.deliveryLocation")}
            <input value={buyerProfile.locationName} readOnly className="mt-1 w-full rounded-md border border-line bg-canvas-warm px-3 py-2" />
          </label>
          <label>
            {t("dash.distance")} (KM)
            <input value={radius} onChange={(e) => setRadius(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
          </label>
          <label>
            {t("dash.qualityNotes")}
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" rows={3} />
          </label>
          <button type="submit" className="dash-btn dash-btn-primary" disabled={busy}>
            {busy ? t("dash.publishing") : t("dash.buyerNavCreateDemand")}
          </button>
        </form>
      )}
    </BuyerPageShell>
  )
}

export function BuyerRequestsListPage() {
  const { t } = useTranslation()
  const { buyerProfile, requests, responses } = useDemandNetwork()
  const mine = requests.filter((r) => r.buyerId === buyerProfile?.userId)

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavMyDemands")}</h1>
      <Link to="/buyer-dashboard/create-demand" className="dash-btn dash-btn-primary mt-4 inline-flex">
        + {t("dash.buyerNavCreateDemand")}
      </Link>
      {mine.length === 0 ? (
        <div className="mt-4 dash-card p-5">
          <p className="text-sm">{t("dash.noActiveDemands")}</p>
          <p className="mt-1 text-[12px] text-ink-muted">{t("dash.createFirstDemand")}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {mine.map((r) => {
            const count = responses.filter((x) => x.requestId === r.id && x.status !== "withdrawn").length
            const remaining = Math.max(0, r.quantityKg - r.filledKg)
            return (
              <li key={r.id} className="dash-card p-4 text-sm">
                <p className="font-medium">
                  {r.crop} · {formatKg(r.quantityKg)} · ₹{r.pricePerKg}
                  {t("dash.perKg")}
                </p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {t("dash.neededByDate")} {new Date(r.neededBy).toLocaleDateString()} · {requestStatusLabel(r.status)}
                </p>
                <p className="mt-1 text-[12px]">
                  {formatKg(r.filledKg)} / {formatKg(r.quantityKg)}
                  {remaining > 0 ? ` · ${formatKg(remaining)} ${t("dash.remaining")}` : ""}
                </p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {count} {t("dash.buyerNavResponses")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/buyer-dashboard/responses" className="dash-btn dash-btn-primary text-[12px]">
                    {t("dash.viewResponses")}
                  </Link>
                  <Link to="/buyer-dashboard/farmers" className="dash-btn text-[12px]">
                    {t("dash.viewMatches")}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </BuyerPageShell>
  )
}

export function BuyerResponsesPage() {
  const { t } = useTranslation()
  const { buyerProfile, requests, responses, acceptOffer, rejectOffer, counterOffer } = useDemandNetwork()
  const [counterFor, setCounterFor] = useState<string | null>(null)
  const [qty, setQty] = useState("")
  const [price, setPrice] = useState("")
  const [needed, setNeeded] = useState("")
  const [flash, setFlash] = useState<string | null>(null)

  const mine = responses.filter((r) => {
    const req = requests.find((x) => x.id === r.requestId)
    return req?.buyerId === buyerProfile?.userId && (r.status === "awaiting_buyer" || r.status === "counter")
  })

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavResponses")}</h1>
      {mine.length === 0 ? (
        <div className="mt-4 dash-card p-5">
          <p className="text-sm font-medium">{t("dash.noFarmerResponses")}</p>
          <p className="mt-1 text-[12px] text-ink-muted">{t("dash.responsesWillAppear")}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          <AnimatePresence>
            {mine.map((r) => {
              const req = requests.find((x) => x.id === r.requestId)
              if (!req) return null
              return (
                <motion.li
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="dash-card p-4 text-sm"
                >
                  <p className="font-medium uppercase">{req.crop}</p>
                  <p className="mt-1 text-ink-muted">
                    {t("dash.required")} {formatKg(req.quantityKg)} · {t("dash.farmer")} {r.farmerLabel} ·{" "}
                    {formatKg(r.offeredQuantityKg)} · ₹{r.pricePerKg}
                    {t("dash.perKg")} · {t("dash.expectedHarvest")} {r.expectedHarvestDate}
                  </p>
                  <p className="mt-1 text-[11px] text-leaf">
                    {r.offeredQuantityKg < req.quantityKg - req.filledKg
                      ? `${t("dash.partialFulfillment")}: ${formatKg(r.offeredQuantityKg)} / ${formatKg(req.quantityKg)} KG`
                      : t("dash.fullMatch")}
                  </p>
                  {flash === r.id ? (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-leaf">
                      ✓ {t("dash.farmConnectionCreated")}
                    </motion.p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="dash-btn dash-btn-primary"
                      onClick={() => {
                        acceptOffer(r.id)
                        setFlash(r.id)
                      }}
                    >
                      {t("dash.accept")}
                    </button>
                    <button type="button" className="dash-btn" onClick={() => rejectOffer(r.id)}>
                      {t("dash.reject")}
                    </button>
                    <button type="button" className="dash-btn" onClick={() => setCounterFor(r.id)}>
                      {t("dash.submitOffer")}
                    </button>
                  </div>
                  {counterFor === r.id ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <input
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder={t("dash.quantityKg")}
                        className="rounded-md border border-line px-2 py-1.5"
                      />
                      <input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={t("dash.pricePerKg")}
                        className="rounded-md border border-line px-2 py-1.5"
                      />
                      <input type="date" value={needed} onChange={(e) => setNeeded(e.target.value)} className="rounded-md border border-line px-2 py-1.5" />
                      <button
                        type="button"
                        className="dash-btn dash-btn-primary sm:col-span-3"
                        onClick={() => {
                          counterOffer(r.id, {
                            quantityKg: Number(qty) || r.offeredQuantityKg,
                            pricePerKg: Number(price) || r.pricePerKg,
                            neededBy: needed || req.neededBy,
                          })
                          setCounterFor(null)
                        }}
                      >
                        {t("dash.submitOffer")}
                      </button>
                    </div>
                  ) : null}
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>
      )}
    </BuyerPageShell>
  )
}

export function BuyerFarmersPage() {
  const { t } = useTranslation()
  const { buyerProfile } = useDemandNetwork()
  const farms = useMemo(() => {
    if (!buyerProfile) return []
    return listFarms()
      .map((f) => ({ ...f, distance: distanceKm(buyerProfile, f) }))
      .filter((f) => f.distance <= 120)
      .sort((a, b) => a.distance - b.distance)
  }, [buyerProfile])

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavNearby")}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t("dash.locationHelpBuyer")}</p>
      {farms.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">{t("dash.noSuitableFarmers")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {farms.map((f) => (
            <li key={f.farmerId} className="dash-card p-4 text-sm">
              <p className="font-medium">
                {f.crop} · {f.expectedHarvestKg != null ? formatKg(f.expectedHarvestKg) : t("dash.expectedHarvest")}
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {f.locationName} · {f.distance} KM · {t("dash.growthStage")} {f.growthStage}
              </p>
            </li>
          ))}
        </ul>
      )}
    </BuyerPageShell>
  )
}

export function BuyerFarmLinksPage() {
  const { t } = useTranslation()
  const { buyerProfile, links, requests } = useDemandNetwork()
  const mine = links.filter((l) => l.buyerId === buyerProfile?.userId)

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavLinks")}</h1>
      {mine.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">{t("dash.noActiveFarmLinks")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {mine.map((l) => {
            const req = requests.find((r) => r.id === l.requestId)
            const remaining = req ? Math.max(0, req.quantityKg - req.filledKg) : null
            return (
              <li key={l.id} className="dash-card p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium uppercase">{l.crop}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-leaf">
                    <span className="h-1.5 w-1.5 rounded-full bg-leaf dash-pulse" />
                    {l.status.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2">
                  {l.farmerLabel} · {formatKg(l.agreedQuantityKg)} · ₹{l.agreedPricePerKg}
                  {t("dash.perKg")}
                </p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  {t("dash.expectedHarvest")} {l.expectedHarvestDate}
                  {remaining != null && remaining > 0
                    ? ` · ${t("dash.remaining")} ${formatKg(remaining)}`
                    : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to={`/buyer-dashboard/farm-links/${l.id}`} className="dash-btn dash-btn-primary inline-flex text-[12px]">
                    {t("dash.contactFarmer")}
                  </Link>
                  <Link to={`/buyer-dashboard/farm-links/${l.id}`} className="dash-btn inline-flex text-[12px]">
                    {t("dash.trackDelivery")}
                  </Link>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </BuyerPageShell>
  )
}

export function BuyerOrdersPage() {
  const { t } = useTranslation()
  const { buyerProfile, links } = useDemandNetwork()
  const mine = links.filter((l) => l.buyerId === buyerProfile?.userId && l.status === "active")

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavActiveOrders")}</h1>
      {mine.length === 0 ? (
        <div className="mt-4 dash-card p-5">
          <p className="text-sm">{t("dash.noActiveOrders")}</p>
          <p className="mt-1 text-[12px] text-ink-muted">{t("dash.ordersAppearAfterAccept")}</p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {mine.map((l) => (
            <li key={l.id} className="dash-card p-4 text-sm">
              <p className="font-medium uppercase">{l.crop}</p>
              <p className="mt-1">
                {formatKg(l.agreedQuantityKg)} · ₹{l.agreedPricePerKg}
                {t("dash.perKg")} · {l.farmerLabel}
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {t("dash.expectedHarvest")} {l.expectedHarvestDate} · {t(deliveryStatusKey(l.deliveryStatus))}
              </p>
              <Link to={`/buyer-dashboard/farm-links/${l.id}`} className="dash-btn mt-3 inline-flex text-[12px]">
                {t("dash.viewDetails")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BuyerPageShell>
  )
}

export function BuyerDeliveriesPage() {
  const { t } = useTranslation()
  const { buyerProfile, links } = useDemandNetwork()
  const mine = links.filter((l) => l.buyerId === buyerProfile?.userId && l.status === "active")

  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{t("dash.buyerNavDeliveries")}</h1>
      <p className="mt-1 text-sm text-ink-muted">{t("dash.deliveryStagesHint")}</p>
      {mine.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">{t("dash.noDeliveriesYet")}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {mine.map((l) => (
            <li key={l.id} className="dash-card p-4 text-sm">
              <p className="font-medium">
                {l.crop} · {formatKg(l.agreedQuantityKg)}
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {t(deliveryStatusKey(l.deliveryStatus))} · {t("dash.eta")} {l.expectedHarvestDate}
              </p>
              <p className="mt-1 text-[12px] text-ink-muted">
                {t("dash.deliveryLocation")}: {l.locationName}
              </p>
              <Link to={`/buyer-dashboard/farm-links/${l.id}`} className="dash-btn mt-3 inline-flex text-[12px]">
                {t("dash.contactFarmer")}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BuyerPageShell>
  )
}

export function BuyerSimplePage({ title, body }: { title: string; body: string }) {
  return (
    <BuyerPageShell>
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-2 text-sm text-ink-muted">{body}</p>
    </BuyerPageShell>
  )
}

// Re-export legacy name used by older imports
export { BuyerDashboardHome as BuyerDashboardPage }
