export type SchemePurpose =
  | "income"
  | "credit"
  | "irrigation"
  | "equipment"
  | "insurance"
  | "horticulture"
  | "infrastructure"

export type FarmerType = "individual" | "tenant" | "other"

export type SchemeRecord = {
  id: string
  name: string
  government: string
  sourceName: string
  officialUrl: string
  verifyUrl?: string
  states: Array<"all" | "Tamil Nadu">
  purposes: SchemePurpose[]
  farmerTypes: Array<FarmerType | "all">
  crops: "all" | "horticulture"
  summary: string
  benefit?: string
  documents: string[]
  steps: string[]
  facts: string[]
  exclusions: string[]
  eligibilityMode: "pm-kisan" | "kcc" | "department-verify"
}

export const verifiedSchemes: SchemeRecord[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    government: "Government of India, Ministry of Agriculture & Farmers Welfare",
    sourceName: "PM-KISAN portal",
    officialUrl: "https://www.pmkisan.gov.in/",
    verifyUrl: "https://www.pmkisan.gov.in/",
    states: ["all"],
    purposes: ["income"],
    farmerTypes: ["individual"],
    crops: "all",
    summary:
      "Central income-support scheme for landholding farmer families, subject to notified eligibility and exclusions.",
    benefit: "₹6,000 per year, subject to scheme rules and eligibility.",
    documents: [
      "Land records as required by the State / implementing agency",
      "Bank account details for Direct Benefit Transfer",
      "Aadhaar-based eKYC is completed on the official portal (do not enter Aadhaar here)",
    ],
    steps: [
      "Review eligibility on the official PM-KISAN portal.",
      "Use Know Your Status on the official website or app if already registered.",
      "Complete eKYC on the official portal or via notified CSC / app methods if you are a registered farmer.",
      "Do not treat this app as an official government determination.",
    ],
    facts: [
      "Benefits are intended for landholding farmer families, subject to scheme rules.",
      "Official materials list exclusion categories such as certain government employees, income-tax payers, and certain professionals.",
      "The official portal states that eKYC is mandatory for registered farmers.",
      "The official portal provides Know Your Status for registered farmers.",
    ],
    exclusions: [
      "Institutional landholders",
      "Income-tax payers (as notified)",
      "Certain serving / retired government employees (as notified)",
      "Certain professionals such as doctors, engineers, lawyers, chartered accountants and architects (as notified)",
    ],
    eligibilityMode: "pm-kisan",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    government: "Government of India",
    sourceName: "PMFBY portal",
    officialUrl: "https://pmfby.gov.in/",
    states: ["all"],
    purposes: ["insurance"],
    farmerTypes: ["all"],
    crops: "all",
    summary: "National crop insurance scheme. Notified crops, seasons, and premium rules apply.",
    documents: ["Enrolment through the official PMFBY channel or notified bank / CSC process"],
    steps: [
      "Confirm whether your crop and season are notified in your district.",
      "Apply only through official PMFBY / authorised channels.",
    ],
    facts: [
      "PMFBY is the Government of India’s crop insurance scheme published at pmfby.gov.in.",
      "Coverage depends on notified crops, areas, and seasons — verify on the official portal.",
    ],
    exclusions: [],
    eligibilityMode: "department-verify",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    government: "Government of India / banks (NABARD-linked framework)",
    sourceName: "India.gov.in — Kisan Credit Card",
    officialUrl: "https://www.india.gov.in/spotlight/kisan-credit-card-kcc-scheme",
    states: ["all"],
    purposes: ["credit"],
    farmerTypes: ["individual", "tenant"],
    crops: "all",
    summary:
      "Credit facility for farmers. Tamil Nadu agriculture policy notes that individual and tenant farmers may avail KCC subject to the scheme’s conditions.",
    documents: [
      "Identity and address proof as required by the lending bank",
      "Land / tenancy documents as required by the bank",
    ],
    steps: [
      "Approach a notified bank or official channel.",
      "Eligibility and limits are decided by the lender under scheme conditions.",
    ],
    facts: [
      "KCC is an official agricultural credit product described on india.gov.in.",
      "Tamil Nadu agriculture policy documentation states that individual and tenant farmers are eligible to avail the benefit, subject to the scheme’s conditions.",
    ],
    exclusions: [],
    eligibilityMode: "kcc",
  },
  {
    id: "tn-horticulture",
    name: "Tamil Nadu horticulture and plantation crop support (department schemes)",
    government: "Government of Tamil Nadu — Department of Horticulture and Plantation Crops",
    sourceName: "tnhorticulture.tn.gov.in",
    officialUrl: "https://tnhorticulture.tn.gov.in/",
    verifyUrl: "https://tnhorticulture.tn.gov.in/current-scheme-gos",
    states: ["Tamil Nadu"],
    purposes: ["horticulture", "irrigation", "infrastructure"],
    farmerTypes: ["all"],
    crops: "horticulture",
    summary:
      "State horticulture department publishes current scheme Government Orders, including National Horticulture Mission and Per Drop More Crop (micro-irrigation).",
    documents: ["As specified in the relevant Government Order on the official department site"],
    steps: [
      "Open the official Tamil Nadu horticulture website.",
      "Review current scheme GOs rather than third-party summaries.",
      "Confirm eligibility with the department or notified local office.",
    ],
    facts: [
      "The Department of Horticulture and Plantation Crops, Government of Tamil Nadu, publishes current scheme GOs at tnhorticulture.tn.gov.in.",
      "Listed programmes include National Horticulture Mission (NHM) and Per Drop More Crop (micro-irrigation), among others on the official current-scheme list.",
      "Specific farmer-level eligibility is defined in those GOs and must be verified with the department.",
    ],
    exclusions: [],
    eligibilityMode: "department-verify",
  },
  {
    id: "pdmc",
    name: "Per Drop More Crop (micro-irrigation)",
    government: "Government of India, implemented in Tamil Nadu via the horticulture department GOs",
    sourceName: "Tamil Nadu horticulture current scheme GOs",
    officialUrl: "https://tnhorticulture.tn.gov.in/current-scheme-gos",
    states: ["Tamil Nadu"],
    purposes: ["irrigation"],
    farmerTypes: ["all"],
    crops: "all",
    summary:
      "Micro-irrigation support listed on the official Tamil Nadu horticulture current-scheme GO page. Farmer-level eligibility is in the GO, not in this app.",
    documents: ["As specified in the official Government Order"],
    steps: [
      "Read the latest Per Drop More Crop / micro-irrigation GO on the official TN horticulture site.",
      "Apply only through notified departmental channels.",
    ],
    facts: [
      "Per Drop More Crop (PDMC) / micro-irrigation appears on the official Tamil Nadu horticulture current scheme GO list.",
      "Do not assume subsidy percentages or plot-size limits from unofficial sites.",
    ],
    exclusions: [],
    eligibilityMode: "department-verify",
  },
]
