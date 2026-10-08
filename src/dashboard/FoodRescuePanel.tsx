import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useMemo, useState } from "react"
import { formatKg } from "../data/landingPageData"
import { useTranslation } from "../i18n/LanguageProvider"
import {
  PROCESSING_OPTIONS,
  REDISTRIBUTION_OPTIONS,
  VERIFIED_DONATION_ORGS,
  rankRescueOptions,
  type RescuePathway,
} from "../lib/foodRescue"
import { useLiveFarm } from "./liveFarm"
import { useWorkspace } from "./workspace"

export function FoodRescuePanel() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const { harvestKg, demandKg } = useLiveFarm()
  const { rescueOption, setRescueOption } = useWorkspace()
  const [open, setOpen] = useState<RescuePathway | null>(null)
  const [processingPick, setProcessingPick] = useState<string | null>(null)
  const [redistributionPick, setRedistributionPick] = useState<string | null>(null)
  const [donationPick, setDonationPick] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState<RescuePathway | null>(null)

  const surplus =
    harvestKg != null && demandKg != null ? Math.max(0, harvestKg - demandKg) : null
  const buyerKg = surplus != null ? Math.round(surplus * 0.6) : null
  const rescueKg =
    surplus != null && buyerKg != null ? Math.max(0, surplus - buyerKg) : 200
  const displaySurplus = surplus ?? 200

  const hasVerifiedDonationOrg = VERIFIED_DONATION_ORGS.length > 0
  const recommendation = useMemo(
    () =>
      rankRescueOptions({
        quantityKg: rescueKg,
        shelfLifeHours: 16,
        nearestKm: 24,
        hasVerifiedDonationOrg,
      }),
    [rescueKg, hasVerifiedDonationOrg],
  )

  function toggle(option: RescuePathway) {
    setOpen((prev) => (prev === option ? null : option))
    setRescueOption(option)
  }

  const pathwayOptions = [
    { id: "processing" as const, label: t("dash.processing") },
    { id: "redistribution" as const, label: t("dash.redistribution") },
    { id: "donation" as const, label: t("dash.donation") },
  ]

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat value={formatKg(displaySurplus)} label={t("dash.potentialSurplus")} />
        <Stat value={buyerKg != null ? formatKg(buyerKg) : "—"} label={t("dash.buyerMatched")} />
        <Stat value={formatKg(rescueKg)} label={t("dash.remainingForRescue")} />
      </div>

      <div className="mt-5 rounded-md border border-forest/30 bg-canvas-warm p-4">
        <p className="text-[11px] tracking-[0.16em] uppercase text-leaf">{t("dash.recommended")}</p>
        <p className="mt-1 text-sm font-medium capitalize">
          {pathwayOptions.find((o) => o.id === recommendation.recommended)?.label ?? recommendation.recommended}
        </p>
        <p className="mt-1 text-[12px] text-ink-muted">{recommendation.reason}</p>
      </div>

      <div className="mt-4 grid gap-2">
        {pathwayOptions.map((option) => {
          const isOpen = open === option.id
          const isBest = recommendation.recommended === option.id
          return (
            <div key={option.id} className={`dash-card overflow-hidden ${rescueOption === option.id ? "border-forest" : ""}`}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 p-3 text-left"
                onClick={() => toggle(option.id)}
              >
                <span className="font-medium">
                  {confirmed === option.id ? `✓ ${option.label}` : option.label}
                  {isBest ? (
                    <span className="ml-2 text-[11px] font-normal text-leaf">{t("dash.recommended")}</span>
                  ) : null}
                </span>
                <span className="text-[12px] text-ink-muted">{isOpen ? t("dash.hide") : t("dash.open")}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.div
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="border-t border-line px-3 pb-4"
                  >
                    {option.id === "processing" ? (
                      <ProcessingPanel
                        quantityKg={rescueKg}
                        selected={processingPick}
                        onSelect={setProcessingPick}
                        onConfirm={() => {
                          setConfirmed("processing")
                          setRescueOption("processing")
                        }}
                        confirmed={confirmed === "processing"}
                      />
                    ) : null}
                    {option.id === "redistribution" ? (
                      <RedistributionPanel
                        quantityKg={rescueKg}
                        selected={redistributionPick}
                        onSelect={setRedistributionPick}
                        onConfirm={() => {
                          setConfirmed("redistribution")
                          setRescueOption("redistribution")
                        }}
                        confirmed={confirmed === "redistribution"}
                      />
                    ) : null}
                    {option.id === "donation" ? (
                      <DonationPanel
                        selected={donationPick}
                        onSelect={setDonationPick}
                        onConfirm={() => {
                          setConfirmed("donation")
                          setRescueOption("donation")
                        }}
                        confirmed={confirmed === "donation"}
                      />
                    ) : null}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ProcessingPanel({
  quantityKg,
  selected,
  onSelect,
  onConfirm,
  confirmed,
}: {
  quantityKg: number
  selected: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  confirmed: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="pt-3">
      <p className="text-[11px] tracking-[0.16em] uppercase text-leaf">{t("dash.processingOptions")}</p>
      <p className="mt-2 text-sm">
        {t("dash.estimatedQuantity")}: {formatKg(quantityKg)}
      </p>
      <p className="mt-1 text-[12px] text-ink-muted">{t("dash.processingExtendLife")}</p>
      <ul className="mt-3 space-y-2">
        {PROCESSING_OPTIONS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                selected === item.id ? "border-forest" : "border-line"
              }`}
              onClick={() => onSelect(item.id)}
            >
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">{item.detail}</p>
              {item.id === "partner" ? (
                <p className="mt-1 text-[11px] text-amber">{t("dash.potentialProcessingSim")}</p>
              ) : null}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="dash-btn dash-btn-primary mt-4"
        disabled={!selected}
        onClick={onConfirm}
      >
        {t("dash.selectProcessing")}
      </button>
      {confirmed ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-leaf"
        >
          {t("dash.processingPathSelected")}
        </motion.p>
      ) : null}
    </div>
  )
}

function RedistributionPanel({
  quantityKg,
  selected,
  onSelect,
  onConfirm,
  confirmed,
}: {
  quantityKg: number
  selected: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  confirmed: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="pt-3">
      <p className="text-[11px] tracking-[0.16em] uppercase text-leaf">{t("dash.redistributionOptions")}</p>
      <p className="mt-2 text-sm">
        {t("dash.quantityAvailable")}: {formatKg(quantityKg)}
      </p>
      <ul className="mt-3 space-y-2">
        {REDISTRIBUTION_OPTIONS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                selected === item.id ? "border-forest" : "border-line"
              }`}
              onClick={() => onSelect(item.id)}
            >
              <p className="font-medium">{item.title}</p>
              <p className="mt-0.5 text-[12px] text-ink-muted">
                {t("dash.distanceLabel")} {item.distanceKm} KM · {t("dash.timeWindow")} {item.window} ·{" "}
                {t("dash.shelfLifeCompatible")}
              </p>
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="dash-btn dash-btn-primary mt-4"
        disabled={!selected}
        onClick={onConfirm}
      >
        {t("dash.selectRedistribution")}
      </button>
      {confirmed ? (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-leaf"
        >
          {t("dash.redistributionPlanCreated")}
          <span className="mt-1 block text-[11px] text-ink-muted">{t("dash.simulatedPlan")}</span>
        </motion.p>
      ) : null}
    </div>
  )
}

function DonationPanel({
  selected,
  onSelect,
  onConfirm,
  confirmed,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onConfirm: () => void
  confirmed: boolean
}) {
  const { t } = useTranslation()
  const options = [
    { id: "community", title: t("dash.communityFoodSupport") },
    { id: "ngo", title: t("dash.verifiedNgoRescue") },
    { id: "institutional", title: t("dash.localInstitutionalSupport") },
  ]

  return (
    <div className="pt-3">
      <p className="text-[11px] tracking-[0.16em] uppercase text-leaf">{t("dash.donationOptions")}</p>
      {VERIFIED_DONATION_ORGS.length === 0 ? (
        <p className="mt-3 text-sm text-ink-muted">{t("dash.noVerifiedOrg")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {VERIFIED_DONATION_ORGS.map((org) => (
            <li key={org.id} className="rounded-md border border-line px-3 py-2 text-sm">
              {org.name} · {org.kind}
            </li>
          ))}
        </ul>
      )}
      <ul className="mt-3 space-y-2">
        {options.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                selected === item.id ? "border-forest" : "border-line"
              }`}
              onClick={() => onSelect(item.id)}
            >
              {item.title}
            </button>
          </li>
        ))}
      </ul>
      <button
        type="button"
        className="dash-btn dash-btn-primary mt-4"
        disabled={!selected}
        onClick={onConfirm}
      >
        {t("dash.selectDonation")}
      </button>
      {VERIFIED_DONATION_ORGS.length === 0 ? (
        <p className="mt-2 text-[12px] text-ink-muted">{t("dash.pathwaySavedLocal")}</p>
      ) : null}
      {confirmed ? (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-leaf">
          {t("dash.donationPathSelected")}
          {VERIFIED_DONATION_ORGS.length === 0 ? (
            <span className="mt-1 block text-[11px] text-ink-muted">{t("dash.simulatedPreference")}</span>
          ) : null}
        </motion.p>
      ) : null}
    </div>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="dash-card p-4">
      <p className="font-display text-2xl">{value}</p>
      <p className="mt-1 text-[12px] text-ink-muted">{label}</p>
    </div>
  )
}
