import { useMemo, useState } from "react"
import { useTranslation } from "../i18n/LanguageProvider"
import { AiApiError, explainSchemeResult } from "../lib/aiApi"
import type { FarmerType, SchemePurpose } from "../data/schemes"
import { evaluateScheme, filterSchemes, type FarmerProfile } from "../lib/schemeEligibility"
import { FeatureFrame } from "./FeatureFrame"

const initial: FarmerProfile = {
  state: "Tamil Nadu",
  district: "",
  landOwnership: "owned",
  landholdingAcres: "2",
  farmerType: "individual",
  crop: "Tomato",
  age: "",
  occupation: "farmer",
  incomeTaxPayer: false,
  governmentEmployee: false,
  existingBeneficiary: false,
  purpose: "all",
}

export function GovernmentSchemesPage() {
  const { t } = useTranslation()
  const [profile, setProfile] = useState<FarmerProfile>(initial)
  const [query, setQuery] = useState("")
  const [checked, setChecked] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [explain, setExplain] = useState<Record<string, string>>({})
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const results = useMemo(() => {
    if (!checked) return []
    return filterSchemes(profile, query).map((scheme) => evaluateScheme(scheme, profile))
  }, [checked, profile, query])

  const update = <K extends keyof FarmerProfile>(key: K, value: FarmerProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }))
  }

  const explainOne = async (id: string) => {
    const row = results.find((item) => item.scheme.id === id)
    if (!row) return
    setBusyId(id)
    setError(null)
    try {
      const text = await explainSchemeResult({
        schemeName: row.scheme.name,
        facts: row.scheme.facts,
        eligibility: row.status,
        why: row.why,
      })
      setExplain((current) => ({ ...current, [id]: text }))
    } catch (err) {
      setError(err instanceof AiApiError ? err.message : t("dash.aiFailed"))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <FeatureFrame title={t("dash.schemesTitle")} subtitle={t("dash.schemesBody")}>
      <p className="text-[12px] text-amber">{t("dash.schemeDisclaimer")}</p>

      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          setChecked(true)
        }}
      >
        <Select
          label={t("dash.state")}
          value={profile.state}
          onChange={(value) => update("state", value)}
          options={["Tamil Nadu", "Karnataka", "Andhra Pradesh", "Kerala", "Other"]}
        />
        <Text label={t("dash.district")} value={profile.district} onChange={(value) => update("district", value)} />
        <Select
          label={t("dash.landOwnership")}
          value={profile.landOwnership}
          onChange={(value) => update("landOwnership", value as FarmerProfile["landOwnership"])}
          options={["owned", "tenant", "other"]}
        />
        <Text
          label={t("dash.landholding")}
          value={profile.landholdingAcres}
          onChange={(value) => update("landholdingAcres", value)}
        />
        <Select
          label={t("dash.farmerType")}
          value={profile.farmerType}
          onChange={(value) => update("farmerType", value as FarmerType)}
          options={["individual", "tenant", "other"]}
        />
        <Text label={t("dash.crop")} value={profile.crop} onChange={(value) => update("crop", value)} />
        <Text label={t("dash.age")} value={profile.age} onChange={(value) => update("age", value)} />
        <Select
          label={t("dash.occupation")}
          value={profile.occupation}
          onChange={(value) => update("occupation", value as FarmerProfile["occupation"])}
          options={["farmer", "professional", "other"]}
        />
        <Select
          label={t("dash.purpose")}
          value={profile.purpose}
          onChange={(value) => update("purpose", value as SchemePurpose | "all")}
          options={["all", "income", "credit", "irrigation", "equipment", "insurance", "horticulture", "infrastructure"]}
        />
        <Toggle
          label={t("dash.incomeTax")}
          checked={profile.incomeTaxPayer}
          onChange={(value) => update("incomeTaxPayer", value)}
        />
        <Toggle
          label={t("dash.govEmployee")}
          checked={profile.governmentEmployee}
          onChange={(value) => update("governmentEmployee", value)}
        />
        <Toggle
          label={t("dash.existingBeneficiary")}
          checked={profile.existingBeneficiary}
          onChange={(value) => update("existingBeneficiary", value)}
        />
        <button type="submit" className="dash-btn dash-btn-primary sm:col-span-2">
          {t("dash.checkEligibility")}
        </button>
      </form>

      {checked ? (
        <div className="mt-6">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("dash.searchSchemes")}
            className="w-full rounded-full border border-line px-4 py-2 text-sm"
          />
          <ul className="mt-4 space-y-3">
            {results.map((row) => (
              <li key={row.scheme.id} className="dash-card p-4">
                <p className="font-medium">{row.scheme.name}</p>
                <p className="mt-1 text-[12px] text-ink-muted">{row.scheme.government}</p>
                <p className="mt-2 text-sm">{statusLabel(row.status, t)}</p>
                <p className="mt-1 text-sm text-ink-muted">{row.why}</p>
                {row.scheme.benefit ? <p className="mt-2 text-sm">{row.scheme.benefit}</p> : null}
                <p className="mt-3 text-[12px] text-amber">{t("dash.schemeDisclaimer")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="dash-btn"
                    onClick={() => setOpen(open === `${row.scheme.id}-docs` ? null : `${row.scheme.id}-docs`)}
                  >
                    {t("dash.viewReqs")}
                  </button>
                  <button
                    type="button"
                    className="dash-btn"
                    onClick={() => setOpen(open === `${row.scheme.id}-steps` ? null : `${row.scheme.id}-steps`)}
                  >
                    {t("dash.viewSteps")}
                  </button>
                  <a
                    href={row.scheme.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="dash-btn dash-btn-primary"
                  >
                    {row.scheme.id === "pm-kisan" ? t("dash.verifyOfficial") : t("dash.viewOfficial")}
                  </a>
                  <button
                    type="button"
                    className="dash-btn"
                    disabled={busyId === row.scheme.id}
                    onClick={() => void explainOne(row.scheme.id)}
                  >
                    {busyId === row.scheme.id ? t("dash.analyzing") : t("dash.explainResult")}
                  </button>
                </div>
                {open === `${row.scheme.id}-docs` ? (
                  <ul className="mt-3 list-disc pl-5 text-sm">
                    {row.scheme.documents.map((doc) => (
                      <li key={doc}>{doc}</li>
                    ))}
                    {row.scheme.exclusions.length ? (
                      <li>
                        {t("dash.exclusions")}: {row.scheme.exclusions.join("; ")}
                      </li>
                    ) : null}
                  </ul>
                ) : null}
                {open === `${row.scheme.id}-steps` ? (
                  <ol className="mt-3 list-decimal pl-5 text-sm">
                    {row.scheme.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                ) : null}
                {explain[row.scheme.id] ? (
                  <p className="mt-3 border-t border-line pt-3 text-sm">{explain[row.scheme.id]}</p>
                ) : null}
              </li>
            ))}
          </ul>
          {results.length === 0 ? <p className="mt-4 text-sm text-ink-muted">{t("dash.noSchemes")}</p> : null}
        </div>
      ) : null}
      {error ? <p className="mt-3 text-sm text-urgent">{error}</p> : null}
    </FeatureFrame>
  )
}

function statusLabel(status: "eligible" | "ineligible" | "more_info", t: (key: string) => string) {
  if (status === "eligible") return `✓ ${t("dash.potentiallyEligible")}`
  if (status === "ineligible") return `✕ ${t("dash.potentiallyNotEligible")}`
  return `⚠ ${t("dash.moreInfoRequired")}`
}

function Text({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="text-sm">
      <span className="text-ink-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line px-3 py-2"
      />
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <label className="text-sm">
      <span className="text-ink-muted">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-line px-3 py-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-sm">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  )
}
