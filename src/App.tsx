import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom"
import { AuthProvider } from "./auth/AuthProvider"
import { ProtectedRoute } from "./auth/ProtectedRoute"
import {
  BuyerCreateDemandPage,
  BuyerDashboardHome,
  BuyerDeliveriesPage,
  BuyerFarmersPage,
  BuyerFarmLinksPage,
  BuyerOrdersPage,
  BuyerRequestsListPage,
  BuyerResponsesPage,
  BuyerSimplePage,
} from "./dashboard/BuyerDashboardPage"
import { BuyerLayout } from "./dashboard/BuyerLayout"
import { BuyerLinkDetailPage, BuyerLinksPage } from "./dashboard/BuyerLinksPage"
import { BuyerOnboardingPage } from "./dashboard/BuyerOnboardingPage"
import { BuyerRequestsPage } from "./dashboard/BuyerRequestsPage"
import { DashboardLayout } from "./dashboard/DashboardLayout"
import { FarmProfileProvider } from "./dashboard/FarmProfileContext"
import { FarmerOnboardingPage } from "./dashboard/FarmerOnboardingPage"
import { DemandOpportunitiesPage, ProductionPlannerPage } from "./dashboard/ProductionPlannerPage"
import { RequireOnboarding, RequireRole } from "./dashboard/RequireOnboarding"
import { RoleSelectPage } from "./dashboard/RoleSelectPage"
import {
  AiAgentsPage,
  AiDecisionsPage,
  CropHealthPage,
  FarmAdvisorPage,
  FarmerSupportPage,
  FoodRescuePage,
  GovernmentSchemesPage,
  HelpPage,
  ImpactPage,
  IrrigationPage,
  LogisticsPage,
  SettingsPage,
  SupportProjectRoute,
  YieldSurplusPage,
} from "./dashboard/featurePages"
import { LanguageProvider } from "./i18n/LanguageProvider"
import { DashboardPage } from "./pages/DashboardPage"
import { LandingPage } from "./pages/LandingPage"

function LinkDetailRoute() {
  const { id } = useParams()
  return <BuyerLinkDetailPage linkId={id || ""} />
}

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <FarmProfileProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Outlet />
                  </ProtectedRoute>
                }
              >
                <Route path="/onboarding" element={<RoleSelectPage />} />
                <Route path="/onboarding/role" element={<RoleSelectPage />} />
                <Route path="/onboarding/farmer" element={<FarmerOnboardingPage />} />
                <Route path="/onboarding/buyer" element={<BuyerOnboardingPage />} />
                <Route path="/farmer-onboarding" element={<FarmerOnboardingPage />} />
                <Route path="/buyer-onboarding" element={<BuyerOnboardingPage />} />

                <Route
                  element={
                    <RequireRole role="farmer">
                      <RequireOnboarding>
                        <DashboardLayout />
                      </RequireOnboarding>
                    </RequireRole>
                  }
                >
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/farm-advisor" element={<FarmAdvisorPage />} />
                  <Route path="/crop-health" element={<CropHealthPage />} />
                  <Route path="/irrigation" element={<IrrigationPage />} />
                  <Route path="/production-planner" element={<ProductionPlannerPage />} />
                  <Route path="/yield-surplus" element={<YieldSurplusPage />} />
                  <Route path="/market-demand" element={<DemandOpportunitiesPage />} />
                  <Route path="/buyer-requests" element={<BuyerRequestsPage />} />
                  <Route path="/buyer-matching" element={<BuyerRequestsPage />} />
                  <Route path="/buyer-links" element={<BuyerLinksPage />} />
                  <Route path="/buyer-links/:id" element={<LinkDetailRoute />} />
                  <Route path="/logistics" element={<LogisticsPage />} />
                  <Route path="/food-rescue" element={<FoodRescuePage />} />
                  <Route path="/farmer-support" element={<FarmerSupportPage />} />
                  <Route path="/government-schemes" element={<GovernmentSchemesPage />} />
                  <Route path="/ai-agents" element={<AiAgentsPage />} />
                  <Route path="/ai-decisions" element={<AiDecisionsPage />} />
                  <Route path="/impact" element={<ImpactPage />} />
                </Route>

                <Route
                  element={
                    <RequireRole role="buyer">
                      <RequireOnboarding>
                        <BuyerLayout />
                      </RequireOnboarding>
                    </RequireRole>
                  }
                >
                  <Route path="/buyer-dashboard" element={<BuyerDashboardHome />} />
                  <Route path="/buyer-dashboard/create-demand" element={<BuyerCreateDemandPage />} />
                  <Route path="/buyer-dashboard/requests" element={<BuyerRequestsListPage />} />
                  <Route path="/buyer-dashboard/responses" element={<BuyerResponsesPage />} />
                  <Route path="/buyer-dashboard/farmers" element={<BuyerFarmersPage />} />
                  <Route path="/buyer-dashboard/farm-links" element={<BuyerFarmLinksPage />} />
                  <Route path="/buyer-dashboard/farm-links/:id" element={<LinkDetailRoute />} />
                  <Route path="/buyer-dashboard/orders" element={<BuyerOrdersPage />} />
                  <Route path="/buyer-dashboard/deliveries" element={<BuyerDeliveriesPage />} />
                  <Route
                    path="/buyer-dashboard/support"
                    element={
                      <BuyerSimplePage
                        title="Buyer Support"
                        body="Ask about sourcing, delivery windows, or partial fills. Confirm commercial decisions directly with the farm using the contact details on your active farm link."
                      />
                    }
                  />
                </Route>

                <Route
                  element={
                    <RequireOnboarding>
                      <DashboardLayout />
                    </RequireOnboarding>
                  }
                >
                  <Route path="/support-project" element={<SupportProjectRoute />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/help" element={<HelpPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FarmProfileProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}

export default App
