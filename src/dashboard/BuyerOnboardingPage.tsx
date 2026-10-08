import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { MapPin, Store } from "lucide-react"
import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import { CROP_OPTIONS } from "../data/farmIntelligence"
import { useTranslation } from "../i18n/LanguageProvider"
import { AiApiError } from "../lib/aiApi"
import {
  isValidMobileNumber,
  loadUserProfile,
  normalizeMobileNumber,
  roundCoordDisplay,
  type BuyerProfile,
} from "../lib/userProfile"
import { geocodeLocation, reverseGeocodeLocation } from "../lib/weatherApi"
import { useDemandNetwork } from "./FarmProfileContext"

const BUYER_TYPES = ["Retailer", "Restaurant", "Wholesaler", "Processor", "Institution", "Other"]

type Loc = {
  latitude: number
  longitude: number
  locationName: string
  city: string | null
  state: string | null
  country: string | null
}

export function BuyerOnboardingPage() {
  const { user } = useAuth()
  const { saveProfile } = useDemandNetwork()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { t } = useTranslation()

  const existing = user ? loadUserProfile(user.uid) : null
  const needsMobile =
    Boolean(existing?.role === "buyer" && existing.onboardingCompleted) &&
    !isValidMobileNumber(existing?.role === "buyer" ? existing.mobileNumber || "" : "")

  const [step, setStep] = useState<"loc" | "manual" | "details">(() =>
    needsMobile && existing?.role === "buyer" && existing.latitude ? "details" : "loc",
  )
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loc, setLoc] = useState<Loc | null>(() =>
    needsMobile && existing?.role === "buyer" && existing.latitude
      ? {
          latitude: existing.latitude,
          longitude: existing.longitude,
          locationName: existing.locationName,
          city: existing.city,
          state: existing.state,
          country: existing.country,
        }
      : null,
  )
  const [manualQuery, setManualQuery] = useState("")
  const [businessName, setBusinessName] = useState(
    () => (existing?.role === "buyer" ? existing.businessName : "") || user?.displayName || "",
  )
  const [buyerType, setBuyerType] = useState(
    () => (existing?.role === "buyer" ? existing.buyerType : "Retailer") || "Retailer",
  )
  const [preferredCrops, setPreferredCrops] = useState<string[]>(() => {
    if (existing?.role === "buyer" && existing.preferredCrops.length > 0) {
      return existing.preferredCrops
    }
    return ["Tomato"]
  })
  const [qty, setQty] = useState(
    () => String((existing?.role === "buyer" ? existing.typicalQuantityKg : null) || 1500),
  )
  const [priceLow, setPriceLow] = useState(() =>
    existing?.role === "buyer" && existing.priceRangeLow != null ? String(existing.priceRangeLow) : "",
  )
  const [priceHigh, setPriceHigh] = useState(() =>
    existing?.role === "buyer" && existing.priceRangeHigh != null
      ? String(existing.priceRangeHigh)
      : "",
  )
  const [mobileNumber, setMobileNumber] = useState(() =>
    existing?.role === "buyer" ? existing.mobileNumber || "" : "",
  )

  if (!user) return <Navigate to="/" replace />
  if (!existing?.role) return <Navigate to="/onboarding/role" replace />
  if (existing.role !== "buyer") return <Navigate to="/onboarding/farmer" replace />
  if (existing.onboardingCompleted && !needsMobile) {
    return <Navigate to="/buyer-dashboard" replace />
  }

  async function applyCoords(latitude: number, longitude: number) {
    setBusy(true)
    try {
      const place = await reverseGeocodeLocation(latitude, longitude)
      setLoc({
        latitude: place.latitude,
        longitude: place.longitude,
        locationName:
          place.locationName || `${roundCoordDisplay(latitude)}, ${roundCoordDisplay(longitude)}`,
        city: place.city,
        state: place.state,
        country: place.country,
      })
      setStep("details")
    } catch {
      setLoc({
        latitude: roundCoordDisplay(latitude),
        longitude: roundCoordDisplay(longitude),
        locationName: `${roundCoordDisplay(latitude)}, ${roundCoordDisplay(longitude)}`,
        city: null,
        state: null,
        country: null,
      })
      setStep("details")
    } finally {
      setBusy(false)
    }
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      setStep("manual")
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => void applyCoords(pos.coords.latitude, pos.coords.longitude),
      () => {
        setBusy(false)
        setStep("manual")
      },
      { enableHighAccuracy: true, timeout: 15000 },
    )
  }

  async function submitManual() {
    setBusy(true)
    setError(null)
    try {
      const place = await geocodeLocation(manualQuery.trim())
      setLoc({
        latitude: roundCoordDisplay(place.latitude),
        longitude: roundCoordDisplay(place.longitude),
        locationName: place.name,
        city: place.city ?? null,
        state: place.state ?? null,
        country: place.country ?? null,
      })
      setStep("details")
    } catch (err) {
      setError(err instanceof AiApiError ? err.message : t("dash.locationNotFound"))
    } finally {
      setBusy(false)
    }
  }

  function finish() {
    if (!user || !loc) return
    if (!isValidMobileNumber(mobileNumber)) {
      setError(t("dash.invalidMobile"))
      return
    }
    if (preferredCrops.length === 0) {
      setError(t("dash.selectPreferredCrop"))
      return
    }
    setError(null)
    const profile: BuyerProfile = {
      userId: user.uid,
      role: "buyer",
      onboardingCompleted: true,
      timestamp: new Date().toISOString(),
      businessName: businessName.trim() || "Buyer",
      buyerType,
      latitude: loc.latitude,
      longitude: loc.longitude,
      locationName: loc.locationName,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      preferredCrops,
      typicalQuantityKg: Number(qty) || null,
      priceRangeLow: priceLow ? Number(priceLow) : null,
      priceRangeHigh: priceHigh ? Number(priceHigh) : null,
      mobileNumber: normalizeMobileNumber(mobileNumber),
    }
    saveProfile(profile)
    navigate("/buyer-dashboard", { replace: true })
  }

  return (
    <div className="command-center min-h-svh bg-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center gap-2 text-forest">
          <Store className="h-5 w-4" />
          <p className="text-[11px] tracking-[0.2em] uppercase text-leaf">{t("dash.buyerOnboarding")}</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card p-5 sm:p-6"
          >
            {step === "loc" ? (
              <>
                <h1 className="font-display text-2xl">{t("dash.whereDoYouSource")}</h1>
                <p className="mt-2 text-sm text-ink-muted">{t("dash.locationHelpBuyer")}</p>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary mt-5 w-full"
                  disabled={busy}
                  onClick={requestLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {busy ? t("dash.locating") : t("dash.useMyLocationShort")}
                </button>
                <button type="button" className="dash-btn mt-3 w-full" onClick={() => setStep("manual")}>
                  {t("dash.enterLocationManual")}
                </button>
              </>
            ) : null}

            {step === "manual" ? (
              <>
                <h1 className="font-display text-2xl">{t("dash.enterYourLocation")}</h1>
                {error ? <p className="mt-2 text-sm text-urgent">{error}</p> : null}
                <input
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm"
                  placeholder={t("dash.cityDistrictPlaceholder")}
                />
                <button
                  type="button"
                  className="dash-btn dash-btn-primary mt-4 w-full"
                  disabled={busy}
                  onClick={() => void submitManual()}
                >
                  {t("dash.findLocation")}
                </button>
              </>
            ) : null}

            {step === "details" && loc ? (
              <>
                <h1 className="font-display text-2xl">
                  {needsMobile ? t("dash.addMobileTitle") : t("dash.buyerProfileTitle")}
                </h1>
                <p className="mt-2 text-sm text-ink-muted">{loc.locationName}</p>
                <div className="mt-4 grid gap-3">
                  {!needsMobile ? (
                    <>
                      <label className="text-sm">
                        <span className="text-ink-muted">{t("dash.businessNameLabel")}</span>
                        <input
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          className="mt-1 w-full rounded-md border border-line px-3 py-2"
                        />
                      </label>
                      <div>
                        <p className="text-sm text-ink-muted">{t("dash.buyerTypeLabel")}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={t("dash.buyerTypeLabel")}>
                          {BUYER_TYPES.map((type) => {
                            const selected = buyerType === type
                            return (
                              <button
                                key={type}
                                type="button"
                                aria-pressed={selected}
                                className={`dash-option rounded-md p-2 text-sm ${selected ? "is-selected" : ""}`}
                                onClick={() => setBuyerType(type)}
                              >
                                {type}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-ink-muted">{t("dash.preferredCropsLabel")}</p>
                        <p className="mt-1 text-[12px] text-ink-muted">{t("dash.selectOneOrMoreCrops")}</p>
                        <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={t("dash.preferredCropsLabel")}>
                          {CROP_OPTIONS.filter((c) => c !== "Other").map((c) => {
                            const selected = preferredCrops.includes(c)
                            return (
                              <button
                                key={c}
                                type="button"
                                aria-pressed={selected}
                                className={`dash-option rounded-md p-2 text-sm ${selected ? "is-selected" : ""}`}
                                onClick={() => {
                                  setPreferredCrops((prev) =>
                                    prev.includes(c)
                                      ? prev.filter((item) => item !== c)
                                      : [...prev, c],
                                  )
                                }}
                              >
                                {c}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <label className="text-sm">
                        <span className="text-ink-muted">{t("dash.typicalQtyLabel")}</span>
                        <input
                          value={qty}
                          onChange={(e) => setQty(e.target.value)}
                          className="mt-1 w-full rounded-md border border-line px-3 py-2"
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-sm">
                          <span className="text-ink-muted">{t("dash.priceLowOptional")}</span>
                          <input
                            value={priceLow}
                            onChange={(e) => setPriceLow(e.target.value)}
                            className="mt-1 w-full rounded-md border border-line px-3 py-2"
                          />
                        </label>
                        <label className="text-sm">
                          <span className="text-ink-muted">{t("dash.priceHighOptional")}</span>
                          <input
                            value={priceHigh}
                            onChange={(e) => setPriceHigh(e.target.value)}
                            className="mt-1 w-full rounded-md border border-line px-3 py-2"
                          />
                        </label>
                      </div>
                    </>
                  ) : null}
                  <label className="text-sm">
                    <span className="text-ink-muted">{t("dash.mobileNumberLabel")}</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      className="mt-1 w-full rounded-md border border-line px-3 py-2"
                      placeholder="10-digit mobile"
                    />
                    <span className="mt-1 block text-[12px] text-ink-muted">
                      {t("dash.mobileHelpBuyer")}
                    </span>
                  </label>
                  {error ? <p className="text-sm text-urgent">{error}</p> : null}
                </div>
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={finish}>
                  {t("dash.continueBuyerDash")}
                </button>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
