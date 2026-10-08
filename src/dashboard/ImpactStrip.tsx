import { Link } from "react-router-dom"
import { formatKg } from "../data/landingPageData"
import { impactDemo } from "../data/dashboardDemo"
import { useTranslation } from "../i18n/LanguageProvider"

export function ImpactStrip() {
  const { t, kickerClass } = useTranslation()

  return (
    <section className="border border-line bg-canvas-warm p-5 sm:p-6">
      <p className={`text-[11px] text-leaf ${kickerClass}`}>Impact Engine</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">Modelled / Calculated</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              {t("dash.foodRescued")}: {formatKg(impactDemo.foodRescuedKg)}
            </li>
            <li>
              {t("dash.valueRecovered")}: ₹{impactDemo.valueInr}
            </li>
            <li>
              {t("dash.co2Avoided")}: {impactDemo.co2eKg} kg
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">Measured impact</p>
          <p className="mt-2 text-sm text-ink-muted">Not connected yet</p>
        </div>
      </div>
      <Link to="/impact" className="dash-btn mt-4 inline-flex text-[12px]">
        {t("dash.viewDetails")}
      </Link>
    </section>
  )
}
