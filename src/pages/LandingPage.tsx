import { AgentStory } from "../components/AgentStory"
import { AgricultureSection } from "../components/AgricultureSection"
import { FinalCTA } from "../components/FinalCTA"
import { Footer } from "../components/Footer"
import { HarvestDonut } from "../components/HarvestDonut"
import { Hero } from "../components/Hero"
import { ImpactMetrics } from "../components/ImpactMetrics"
import { ImpactNetwork } from "../components/ImpactNetwork"
import { Navbar } from "../components/Navbar"
import { ProblemStory } from "../components/ProblemStory"
import { RescueStory } from "../components/RescueStory"
import { SurplusStory } from "../components/SurplusStory"
import "../landing.css"

export function LandingPage() {
  return (
    <div className="landing-page min-h-svh bg-canvas text-ink">
      <Navbar />
      <main>
        <Hero />
        <ProblemStory />
        <AgentStory />
        <SurplusStory />
        <HarvestDonut />
        <AgricultureSection />
        <RescueStory />
        <ImpactMetrics />
        <ImpactNetwork />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  )
}
