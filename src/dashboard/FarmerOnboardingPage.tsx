import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { MapPin, Sprout } from "lucide-react"
import { useState } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import { CROP_OPTIONS } from "../data/farmIntelligence"
import { useTranslation } from "../i18n/LanguageProvider"
import { AiApiError } from "../lib/aiApi"
import { loadUserProfile, isValidMobileNumber, normalizeMobileNumber, roundCoordDisplay, type FarmerProfile } from "../lib/userProfile"
import { geocodeLocation, reverseGeocodeLocation } from "../lib/weatherApi"
import { useDemandNetwork } from "./FarmProfileContext"

type Loc = {
  latitude: number
  longitude: number
  locationName: string
  city: string | null
  state: string | null
  country: string | null
}

export function FarmerOnboardingPage() {
  const { user } = useAuth()
  const { saveProfile } = useDemandNetwork()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const updating = params.get("update") === "1"
  const reduce = useReducedMotion()
  const { t } = useTranslation()

  const [step, setStep] = useState<"loc" | "denied" | "manual" | "details">(() => {
    const p = user ? loadUserProfile(user.uid) : null
    const need =
      Boolean(p?.role === "farmer" && p.onboardingCompleted) &&
      !isValidMobileNumber(p?.role === "farmer" ? p.mobileNumber || "" : "")
    return (params.get("update") === "1" || need) && p?.role === "farmer" && p.latitude
      ? "details"
      : "loc"
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loc, setLoc] = useState<Loc | null>(() => {
    const p = user ? loadUserProfile(user.uid) : null
    const need =
      Boolean(p?.role === "farmer" && p.onboardingCompleted) &&
      !isValidMobileNumber(p?.role === "farmer" ? p.mobileNumber || "" : "")
    if ((params.get("update") === "1" || need) && p?.role === "farmer" && p.latitude) {
      return {
        latitude: p.latitude,
        longitude: p.longitude,
        locationName: p.locationName,
        city: p.city,
        state: p.state,
        country: p.country,
      }
    }
    return null
  })
  const [manualQuery, setManualQuery] = useState("")
  const [farmSize, setFarmSize] = useState("2")
  const [crop, setCrop] = useState("Tomato")
  const [otherCrop, setOtherCrop] = useState("")
  const [growthStage, setGrowthStage] = useState("Flowering / Fruiting")
  const [irrigation, setIrrigation] = useState("Drip / well")
  const [expectedHarvest, setExpectedHarvest] = useState("1500")
  const [mobileNumber, setMobileNumber] = useState(() => {
    const p = user ? loadUserProfile(user.uid) : null
    return p?.role === "farmer" ? p.mobileNumber || "" : ""
  })

  if (!user) return <Navigate to="/" replace />
  const existing = loadUserProfile(user.uid)
  if (!existing?.role) return <Navigate to="/onboarding/role" replace />
  if (existing.role !== "farmer") return <Navigate to="/onboarding/buyer" replace />
  const needsMobile =
    existing.onboardingCompleted && !isValidMobileNumber(existing.mobileNumber || "")
  if (!updating && existing.onboardingCompleted && !needsMobile) {
    return <Navigate to="/dashboard" replace />
  }

  async function applyCoords(latitude: number, longitude: number) {
    setBusy(true)
    setError(null)
    try {
      const place = await reverseGeocodeLocation(latitude, longitude)
      setLoc({
        latitude: place.latitude,
        longitude: place.longitude,
        locationName: place.locationName || `${roundCoordDisplay(latitude)}, ${roundCoordDisplay(longitude)}`,
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
      setError(t("dash.locationUnavailable"))
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => void applyCoords(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setBusy(false)
        if (err.code === err.PERMISSION_DENIED) {
          setStep("denied")
          return
        }
        setStep("manual")
        setError(t("dash.locationUnavailable"))
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
    setError(null)
    const selected = crop === "Other" ? otherCrop.trim() || "Other" : crop
    const harvest = Number(expectedHarvest)
    const acres = Number(farmSize)
    const profile: FarmerProfile = {
      userId: user.uid,
      role: "farmer",
      onboardingCompleted: true,
      timestamp: new Date().toISOString(),
      displayName: user.displayName,
      latitude: loc.latitude,
      longitude: loc.longitude,
      locationName: loc.locationName,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      farmSizeAcres: Number.isFinite(acres) ? acres : null,
      selectedCrop: selected,
      growthStage,
      irrigation,
      expectedHarvestKg: Number.isFinite(harvest) ? harvest : null,
      preferredCrops: [selected],
      mobileNumber: normalizeMobileNumber(mobileNumber),
    }
    saveProfile(profile)
    navigate("/dashboard", { replace: true })
  }

  return (
    <div className="command-center min-h-svh bg-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center gap-2 text-forest">
          <Sprout className="h-5 w-4" />
          <p className="text-[11px] tracking-[0.2em] uppercase text-leaf">{t("dash.farmerOnboarding")}</p>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="dash-card p-5 sm:p-6"
          >
            {step === "loc" || step === "denied" ? (
              <>
                <h1 className="font-display text-2xl">{t("dash.whereIsFarm")}</h1>
                {step === "denied" ? (
                  <p className="mt-2 text-sm text-ink-muted">
                    {t("dash.locationDenied")}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-ink-muted">{t("dash.locationHelpFarm")}</p>
                )}
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" disabled={busy} onClick={requestLocation}>
                  <MapPin className="mr-2 h-4 w-4" />
                  {busy ? t("dash.locating") : step === "denied" ? t("dash.tryAgain") : t("dash.useMyLocationShort")}
                </button>
                <button type="button" className="dash-btn mt-3 w-full" onClick={() => setStep("manual")}>
                  {t("dash.enterLocationManual")}
                </button>
              </>
            ) : null}

            {step === "manual" ? (
              <>
                <h1 className="font-display text-2xl">{t("dash.enterFarmLocation")}</h1>
                {error ? <p className="mt-2 text-sm text-urgent">{error}</p> : null}
                <input
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm"
                  placeholder={t("dash.cityDistrictPlaceholder")}
                />
                <button type="button" className="dash-btn dash-btn-primary mt-4 w-full" disabled={busy} onClick={() => void submitManual()}>
                  {t("dash.findLocation")}
                </button>
              </>
            ) : null}

            {step === "details" && loc ? (
              <>
                <h1 className="font-display text-2xl">{t("dash.farmDetails")}</h1>
                <p className="mt-2 text-sm text-ink-muted">{loc.locationName}</p>
                <div className="mt-4 grid gap-3">
                  <label className="text-sm">
                    <span className="text-ink-muted">{t("dash.farmSizeAcres")}</span>
                    <input value={farmSize} onChange={(e) => setFarmSize(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
                  </label>
                  <div>
                    <p className="text-sm text-ink-muted">{t("dash.currentCropLabel")}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label={t("dash.currentCropLabel")}>
                      {CROP_OPTIONS.map((c) => {
                        const selected = crop === c
                        return (
                          <button
                            key={c}
                            type="button"
                            aria-pressed={selected}
                            className={`dash-option rounded-md p-2 text-sm ${selected ? "is-selected" : ""}`}
                            onClick={() => setCrop(c)}
                          >
                            {c}
                          </button>
                        )
                      })}
                    </div>
                    {crop === "Other" ? (
                      <input value={otherCrop} onChange={(e) => setOtherCrop(e.target.value)} className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm" placeholder={t("dash.cropNamePlaceholder")} />
                    ) : null}
                  </div>
                  <label className="text-sm">
                    <span className="text-ink-muted">{t("dash.growthStageLabel")}</span>
                    <input value={growthStage} onChange={(e) => setGrowthStage(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
                  </label>
                  <label className="text-sm">
                    <span className="text-ink-muted">{t("dash.waterAvailability")}</span>
                    <input value={irrigation} onChange={(e) => setIrrigation(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
                  </label>
                  <label className="text-sm">
                    <span className="text-ink-muted">{t("dash.expectedHarvestOptional")}</span>
                    <input value={expectedHarvest} onChange={(e) => setExpectedHarvest(e.target.value)} className="mt-1 w-full rounded-md border border-line px-3 py-2" />
                  </label>
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
                      {t("dash.mobileHelpFarmer")}
                    </span>
                  </label>
                  {error ? <p className="text-sm text-urgent">{error}</p> : null}
                </div>
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={finish}>
                  {t("dash.continueFarmerDash")}
                </button>
              </>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
