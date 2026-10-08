import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { MapPin, Sprout } from "lucide-react"
import { useMemo, useState } from "react"
import { Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../auth/auth-context"
import { buildFarmIntelligence, CROP_OPTIONS } from "../data/farmIntelligence"
import { AiApiError } from "../lib/aiApi"
import { isOnboardingComplete, roundCoordDisplay, type FarmOnboardingProfile } from "../lib/farmProfile"
import { geocodeLocation, reverseGeocodeLocation } from "../lib/weatherApi"
import { useFarmProfile } from "./FarmProfileContext"

type Step = "ask" | "denied" | "manual" | "confirm" | "intel" | "crops" | "select"

type LocState = {
  latitude: number
  longitude: number
  locationName: string
  city: string | null
  state: string | null
  country: string | null
}

export function FarmOnboardingPage() {
  const { user } = useAuth()
  const { save } = useFarmProfile()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const updating = params.get("update") === "1"
  const reduce = useReducedMotion()

  const [step, setStep] = useState<Step>("ask")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loc, setLoc] = useState<LocState | null>(null)
  const [manualQuery, setManualQuery] = useState("")
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato")
  const [otherCrop, setOtherCrop] = useState("")

  const intel = useMemo(
    () =>
      loc
        ? buildFarmIntelligence({
            state: loc.state,
            country: loc.country,
            locationName: loc.locationName,
          })
        : null,
    [loc],
  )

  if (!user) return <Navigate to="/" replace />
  if (!updating && isOnboardingComplete(user.uid) && step === "ask") {
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
      setStep("confirm")
    } catch (err) {
      setError(err instanceof AiApiError ? err.message : "Location lookup failed.")
      setLoc({
        latitude: roundCoordDisplay(latitude),
        longitude: roundCoordDisplay(longitude),
        locationName: `${roundCoordDisplay(latitude)}, ${roundCoordDisplay(longitude)}`,
        city: null,
        state: null,
        country: null,
      })
      setStep("confirm")
    } finally {
      setBusy(false)
    }
  }

  function requestLocation() {
    setError(null)
    if (!navigator.geolocation) {
      setError("LOCATION UNAVAILABLE")
      setStep("manual")
      return
    }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void applyCoords(pos.coords.latitude, pos.coords.longitude)
      },
      (err) => {
        setBusy(false)
        if (err.code === err.PERMISSION_DENIED) {
          setStep("denied")
          setError("Location access is needed to personalize your farm recommendations.")
          return
        }
        if (err.code === err.TIMEOUT) {
          setError("Location request timed out. Try again or enter your location manually.")
          setStep("manual")
          return
        }
        setError("LOCATION UNAVAILABLE")
        setStep("manual")
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    )
  }

  async function submitManual() {
    const q = manualQuery.trim()
    if (q.length < 2) {
      setError("Enter a city, district, or place name.")
      return
    }
    setBusy(true)
    setError(null)
    try {
      const place = await geocodeLocation(q)
      setLoc({
        latitude: roundCoordDisplay(place.latitude),
        longitude: roundCoordDisplay(place.longitude),
        locationName: place.name,
        city: place.city ?? place.name.split(",")[0] ?? null,
        state: place.state ?? null,
        country: place.country ?? null,
      })
      setStep("confirm")
    } catch (err) {
      setError(err instanceof AiApiError ? err.message : "That location could not be found.")
    } finally {
      setBusy(false)
    }
  }

  function finish(crop: string) {
    if (!user || !loc) return
    const profile: FarmOnboardingProfile = {
      userId: user.uid,
      latitude: loc.latitude,
      longitude: loc.longitude,
      locationName: loc.locationName,
      city: loc.city,
      state: loc.state,
      country: loc.country,
      selectedCrop: crop,
      onboardingCompleted: true,
      timestamp: new Date().toISOString(),
      soilEstimate: intel?.soilType ?? null,
      climateNote: intel?.climate ?? null,
    }
    save(profile)
    navigate("/dashboard", { replace: true })
  }

  return (
    <div className="command-center min-h-svh bg-canvas px-4 py-8 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center gap-2 text-forest">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line bg-card">
            <Sprout className="h-4 w-4" strokeWidth={1.7} />
          </span>
          <div>
            <p className="text-[11px] tracking-[0.2em] uppercase text-leaf">RipeRoute</p>
            <p className="text-sm text-ink-muted">Farm onboarding</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="dash-card p-5 sm:p-6"
          >
            {step === "ask" ? (
              <>
                <h1 className="font-display text-2xl">Where is your farm?</h1>
                <p className="mt-2 text-sm text-ink-muted">
                  Location is requested only after you choose it. We use it to personalize farm recommendations.
                </p>
                <button
                  type="button"
                  className="dash-btn dash-btn-primary mt-5 w-full"
                  disabled={busy}
                  onClick={requestLocation}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {busy ? "Locating your farm..." : "Use My Current Location"}
                </button>
                <button type="button" className="dash-btn mt-3 w-full" onClick={() => setStep("manual")}>
                  Enter Location Manually
                </button>
              </>
            ) : null}

            {step === "denied" ? (
              <>
                <h1 className="font-display text-2xl">Location needed</h1>
                <p className="mt-2 text-sm text-ink-muted">
                  Location access is needed to personalize your farm recommendations.
                </p>
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={requestLocation}>
                  Try Again
                </button>
                <button type="button" className="dash-btn mt-3 w-full" onClick={() => setStep("manual")}>
                  Enter Location Manually
                </button>
              </>
            ) : null}

            {step === "manual" ? (
              <>
                <h1 className="font-display text-2xl">Enter your farm location</h1>
                <p className="mt-2 text-sm text-ink-muted">City, district, or place name.</p>
                {error ? <p className="mt-3 text-sm text-urgent">{error}</p> : null}
                <input
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="City / district / state"
                  className="mt-4 w-full rounded-md border border-line px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  className="dash-btn dash-btn-primary mt-4 w-full"
                  disabled={busy}
                  onClick={() => void submitManual()}
                >
                  {busy ? "Looking up..." : "Find Location"}
                </button>
                <button type="button" className="dash-btn mt-3 w-full" onClick={() => setStep("ask")}>
                  Back
                </button>
              </>
            ) : null}

            {step === "confirm" && loc ? (
              <>
                <motion.p
                  initial={reduce ? false : { scale: 0.96, opacity: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[11px] tracking-[0.18em] uppercase text-leaf"
                >
                  Location found
                </motion.p>
                <h1 className="font-display mt-2 text-2xl">Your location</h1>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row label="City / District" value={loc.city || loc.locationName} />
                  <Row label="State" value={loc.state || "—"} />
                  <Row label="Country" value={loc.country || "—"} />
                  <Row
                    label="Coordinates"
                    value={`${roundCoordDisplay(loc.latitude)}, ${roundCoordDisplay(loc.longitude)}`}
                  />
                </dl>
                <p className="mt-3 text-[11px] text-ink-muted">Kind: OBSERVED (device location) + reverse geocode</p>
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={() => setStep("intel")}>
                  Continue
                </button>
              </>
            ) : null}

            {step === "intel" && intel ? (
              <>
                <h1 className="font-display text-2xl">Farm location intelligence</h1>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="rounded-md border border-line p-3">
                    <p className="text-[11px] text-ink-muted">MODELLED · Estimated soil type</p>
                    <p className="mt-1 font-medium">{intel.soilType}</p>
                    <p className="mt-1 text-[12px] text-ink-muted">Confidence: {intel.soilConfidence}</p>
                    <p className="mt-2 text-[12px] text-ink-muted">Exact soil chemistry requires a soil test.</p>
                  </div>
                  <div className="rounded-md border border-line p-3">
                    <p className="text-[11px] text-ink-muted">MODELLED · Climate</p>
                    <p className="mt-1">{intel.climate}</p>
                  </div>
                  <div className="rounded-md border border-line p-3">
                    <p className="text-[11px] text-ink-muted">MODELLED · Irrigation note</p>
                    <p className="mt-1">{intel.irrigationNote}</p>
                  </div>
                </div>
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={() => setStep("crops")}>
                  Continue
                </button>
              </>
            ) : null}

            {step === "crops" && intel ? (
              <>
                <h1 className="font-display text-2xl">Potentially suitable crops for your area</h1>
                <p className="mt-2 text-sm text-ink-muted">Preliminary AI recommendations</p>
                <ul className="mt-4 space-y-2">
                  {intel.crops.map((crop, index) => (
                    <motion.li
                      key={crop.crop}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : index * 0.06 }}
                      className="rounded-md border border-line p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium">{crop.crop}</p>
                        <span className="text-[11px] text-leaf">{crop.suitability}</span>
                      </div>
                      <p className="mt-1 text-ink-muted">{crop.reason}</p>
                      <p className="mt-1 text-[11px] text-ink-muted">Season: {crop.season}</p>
                    </motion.li>
                  ))}
                </ul>
                <p className="mt-3 text-[12px] text-ink-muted">{intel.disclaimer}</p>
                <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={() => setStep("select")}>
                  Select My Crop
                </button>
              </>
            ) : null}

            {step === "select" ? (
              <>
                <h1 className="font-display text-2xl">What are you currently growing?</h1>
                <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Current crop">
                  {CROP_OPTIONS.map((crop) => {
                    const selected = selectedCrop === crop
                    return (
                      <button
                        key={crop}
                        type="button"
                        aria-pressed={selected}
                        className={`dash-option rounded-md p-3 text-left text-sm ${selected ? "is-selected" : ""}`}
                        onClick={() => setSelectedCrop(crop)}
                      >
                        {crop}
                      </button>
                    )
                  })}
                </div>
                {selectedCrop === "Other" ? (
                  <input
                    value={otherCrop}
                    onChange={(e) => setOtherCrop(e.target.value)}
                    placeholder="Enter crop name"
                    className="mt-3 w-full rounded-md border border-line px-3 py-2 text-sm"
                  />
                ) : null}
                <button
                  type="button"
                  className="dash-btn dash-btn-primary mt-5 w-full"
                  onClick={() => {
                    const crop =
                      selectedCrop === "Other" ? otherCrop.trim() || "Other" : selectedCrop
                    finish(crop)
                  }}
                >
                  Continue to Dashboard
                </button>
                <button type="button" className="dash-btn mt-3 w-full" onClick={() => finish("Unknown")}>
                  I don&apos;t know
                </button>
              </>
            ) : null}

            {error && step !== "manual" && step !== "denied" ? (
              <p className="mt-3 text-sm text-urgent">{error}</p>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-line py-2">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  )
}
