import { createContext, useCallback, useContext, useState, type ReactNode } from "react"

type DemoNoticeValue = {
  message: string | null
  notifyDemo: (message: string) => void
  clear: () => void
}

const DemoNoticeContext = createContext<DemoNoticeValue | null>(null)

export function DemoNoticeProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)

  const notifyDemo = useCallback((next: string) => {
    setMessage(next)
    window.setTimeout(() => setMessage(null), 3200)
  }, [])

  return (
    <DemoNoticeContext.Provider value={{ message, notifyDemo, clear: () => setMessage(null) }}>
      {children}
    </DemoNoticeContext.Provider>
  )
}

export function useDemoNotice() {
  const ctx = useContext(DemoNoticeContext)
  if (!ctx) {
    return {
      message: null,
      notifyDemo: () => undefined,
      clear: () => undefined,
    }
  }
  return ctx
}
