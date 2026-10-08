import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { buyers } from "../data/dashboardDemo"

type Workspace = {
  selectedBuyerId: string | null
  selectBuyer: (id: string) => void
  rescueOption: "processing" | "donation" | "redistribution" | null
  setRescueOption: (value: "processing" | "donation" | "redistribution") => void
  routeOptimized: boolean
  setRouteOptimized: (value: boolean) => void
  selectedBuyer: (typeof buyers)[number] | null
}

const WorkspaceContext = createContext<Workspace | null>(null)

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null)
  const [rescueOption, setRescueOption] = useState<Workspace["rescueOption"]>(null)
  const [routeOptimized, setRouteOptimized] = useState(false)

  const value = useMemo<Workspace>(() => {
    const selectedBuyer = buyers.find((item) => item.id === selectedBuyerId) ?? null
    return {
      selectedBuyerId,
      selectBuyer: setSelectedBuyerId,
      rescueOption,
      setRescueOption,
      routeOptimized,
      setRouteOptimized,
      selectedBuyer,
    }
  }, [rescueOption, routeOptimized, selectedBuyerId])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) {
    return {
      selectedBuyerId: null,
      selectBuyer: () => undefined,
      rescueOption: null,
      setRescueOption: () => undefined,
      routeOptimized: false,
      setRouteOptimized: () => undefined,
      selectedBuyer: null,
    } satisfies Workspace
  }
  return ctx
}
