export const LANG_CODES = [
  "en",
  "ta",
  "hi",
  "te",
  "kn",
  "ml",
  "mr",
  "bn",
  "gu",
  "pa",
  "as",
  "or",
] as const

export type Lang = (typeof LANG_CODES)[number]

export const languages: {
  code: Lang
  native: string
  english: string
  short: string
  fontFamily: string
  fontHref: string | null
}[] = [
  { code: "en", native: "English", english: "English", short: "EN", fontFamily: "Instrument Sans", fontHref: null },
  {
    code: "ta",
    native: "தமிழ்",
    english: "Tamil",
    short: "TA",
    fontFamily: "Noto Sans Tamil",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700&display=swap",
  },
  {
    code: "hi",
    native: "हिन्दी",
    english: "Hindi",
    short: "HI",
    fontFamily: "Noto Sans Devanagari",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap",
  },
  {
    code: "te",
    native: "తెలుగు",
    english: "Telugu",
    short: "TE",
    fontFamily: "Noto Sans Telugu",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap",
  },
  {
    code: "kn",
    native: "ಕನ್ನಡ",
    english: "Kannada",
    short: "KN",
    fontFamily: "Noto Sans Kannada",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap",
  },
  {
    code: "ml",
    native: "മലയാളം",
    english: "Malayalam",
    short: "ML",
    fontFamily: "Noto Sans Malayalam",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700&display=swap",
  },
  {
    code: "mr",
    native: "मराठी",
    english: "Marathi",
    short: "MR",
    fontFamily: "Noto Sans Devanagari",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap",
  },
  {
    code: "bn",
    native: "বাংলা",
    english: "Bengali",
    short: "BN",
    fontFamily: "Noto Sans Bengali",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap",
  },
  {
    code: "gu",
    native: "ગુજરાતી",
    english: "Gujarati",
    short: "GU",
    fontFamily: "Noto Sans Gujarati",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@400;500;600;700&display=swap",
  },
  {
    code: "pa",
    native: "ਪੰਜਾਬੀ",
    english: "Punjabi",
    short: "PA",
    fontFamily: "Noto Sans Gurmukhi",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@400;500;600;700&display=swap",
  },
  {
    code: "as",
    native: "অসমীয়া",
    english: "Assamese",
    short: "AS",
    fontFamily: "Noto Sans Bengali",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap",
  },
  {
    code: "or",
    native: "ଓଡ଼ିଆ",
    english: "Odia",
    short: "OR",
    fontFamily: "Noto Sans Oriya",
    fontHref:
      "https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@400;500;600;700&display=swap",
  },
]

export const STORAGE_KEY = "riperoute.lang"

export function isLang(value: string): value is Lang {
  return (LANG_CODES as readonly string[]).includes(value)
}

export function loadScriptFont(lang: Lang) {
  const meta = languages.find((item) => item.code === lang)
  if (!meta?.fontHref || typeof document === "undefined") return

  const id = `riperoute-font-${lang}`
  if (document.getElementById(id)) return

  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = meta.fontHref
  document.head.appendChild(link)
}

export function applyDocumentLang(lang: Lang) {
  if (typeof document === "undefined") return
  const meta = languages.find((item) => item.code === lang)
  document.documentElement.lang = lang
  document.documentElement.dataset.lang = lang
  document.documentElement.style.setProperty(
    "--font-indic",
    meta ? `"${meta.fontFamily}"` : "Instrument Sans",
  )
  loadScriptFont(lang)
}
