import { verifiedSchemes, type SchemePurpose, type SchemeRecord } from "../data/schemes"
import type { FarmerType } from "../data/schemes"

export type EligibilityStatus = "eligible" | "ineligible" | "more_info"

export type FarmerProfile = {
  state: string
  district: string
  landOwnership: "owned" | "tenant" | "other"
  landholdingAcres: string
  farmerType: FarmerType
  crop: string
  age: string
  occupation: "farmer" | "professional" | "other"
  incomeTaxPayer: boolean
  governmentEmployee: boolean
  existingBeneficiary: boolean
  purpose: SchemePurpose | "all"
}

export type SchemeResult = {
  scheme: SchemeRecord
  status: EligibilityStatus
  why: string
}

export function filterSchemes(profile: FarmerProfile, query: string) {
  const q = query.trim().toLowerCase()
  return verifiedSchemes.filter((scheme) => {
    if (!matchesState(scheme, profile.state)) return false
    if (profile.purpose !== "all" && !scheme.purposes.includes(profile.purpose)) return false
    if (scheme.crops === "horticulture" && profile.crop && !isHorticulture(profile.crop)) return false
    if (!q) return true
    return (
      scheme.name.toLowerCase().includes(q) ||
      scheme.summary.toLowerCase().includes(q) ||
      scheme.purposes.join(" ").includes(q)
    )
  })
}

export function evaluateScheme(scheme: SchemeRecord, profile: FarmerProfile): SchemeResult {
  if (scheme.eligibilityMode === "pm-kisan") return evaluatePmKisan(scheme, profile)
  if (scheme.eligibilityMode === "kcc") return evaluateKcc(scheme, profile)
  return {
    scheme,
    status: "more_info",
    why: "Eligibility requires verification with the relevant department and the official source.",
  }
}

function matchesState(scheme: SchemeRecord, state: string) {
  if (!state) return true
  if (scheme.states.includes("all")) return true
  return state === "Tamil Nadu" && scheme.states.includes("Tamil Nadu")
}

function evaluatePmKisan(scheme: SchemeRecord, profile: FarmerProfile): SchemeResult {
  if (profile.incomeTaxPayer) {
    return {
      scheme,
      status: "ineligible",
      why: "Income-tax payers are listed among PM-KISAN exclusion categories. Potentially not eligible based on the information provided.",
    }
  }
  if (profile.governmentEmployee) {
    return {
      scheme,
      status: "ineligible",
      why: "Certain government employees are listed among PM-KISAN exclusion categories. Potentially not eligible based on the information provided.",
    }
  }
  if (profile.occupation === "professional") {
    return {
      scheme,
      status: "ineligible",
      why: "Certain professionals are listed among PM-KISAN exclusion categories. Potentially not eligible based on the information provided.",
    }
  }
  if (profile.landOwnership === "tenant" || profile.farmerType === "tenant") {
    return {
      scheme,
      status: "ineligible",
      why: "PM-KISAN is described for landholding farmer families. Tenant-only status is potentially not eligible based on the information provided.",
    }
  }
  if (profile.landOwnership !== "owned") {
    return {
      scheme,
      status: "more_info",
      why: "Landholding status is required to screen PM-KISAN. More information is needed.",
    }
  }
  if (!profile.landholdingAcres.trim()) {
    return {
      scheme,
      status: "more_info",
      why: "Landholding size was not provided. More information is required.",
    }
  }
  return {
    scheme,
    status: "eligible",
    why: profile.existingBeneficiary
      ? "Landholding farmer family with no selected exclusion category — potentially eligible, subject to official verification. You indicated you may already be a beneficiary; confirm Know Your Status on the official portal."
      : "Landholding farmer family with no selected exclusion category — potentially eligible, subject to official verification.",
  }
}

function evaluateKcc(scheme: SchemeRecord, profile: FarmerProfile): SchemeResult {
  if (profile.farmerType === "individual" || profile.farmerType === "tenant") {
    return {
      scheme,
      status: "eligible",
      why: "Individual and tenant farmers may avail KCC subject to the scheme’s conditions and bank assessment — potentially eligible, not an approval.",
    }
  }
  return {
    scheme,
    status: "more_info",
    why: "KCC eligibility depends on bank and scheme conditions. More information is required.",
  }
}

function isHorticulture(crop: string) {
  const value = crop.toLowerCase()
  return ["tomato", "mango", "banana", "onion", "chilli", "vegetable", "horticulture"].some((item) =>
    value.includes(item),
  )
}
