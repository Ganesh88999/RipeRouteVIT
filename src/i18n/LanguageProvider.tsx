import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  applyDocumentLang,
  isLang,
  STORAGE_KEY,
  type Lang,
} from "./languages"
import { dictionaries, translate } from "./translations"

type LanguageContextValue = {
  language: Lang
  setLanguage: (lang: Lang) => void
  t: (key: string) => string
  isEnglish: boolean
  kickerClass: string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readStoredLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isLang(stored)) return stored
  } catch {
    /* ignore */
  }
  return "en"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Lang>(() => {
    const initial = readStoredLang()
    applyDocumentLang(initial)
    return initial
  })

  const setLanguage = useCallback((lang: Lang) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    applyDocumentLang(lang)
  }, [])

  const value = useMemo<LanguageContextValue>(() => {
    const isEnglish = language === "en"
    return {
      language,
      setLanguage,
      t: (key: string) => translate(language, key, dictionaries),
      isEnglish,
      kickerClass: isEnglish
        ? "tracking-[0.22em] uppercase"
        : "tracking-normal normal-case leading-snug",
    }
  }, [language, setLanguage])

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: "en" as Lang,
      setLanguage: () => undefined,
      t: (key: string) => translate("en", key, dictionaries),
      isEnglish: true,
      kickerClass: "tracking-[0.22em] uppercase",
    }
  }
  return context
}
