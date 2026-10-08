import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"
import "../dashboard.css"
import { DashShell } from "./DashShell"
import { RipeRouteAssistant } from "./RipeRouteAssistant"
import { WorkspaceProvider } from "./workspace"
import { LiveFarmProvider } from "./liveFarm"

export function DashboardLayout() {
  const location = useLocation()
  const reduce = useReducedMotion()

  return (
    <WorkspaceProvider>
      <LiveFarmProvider>
      <DashShell>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        <RipeRouteAssistant />
      </DashShell>
      </LiveFarmProvider>
    </WorkspaceProvider>
  )
}
