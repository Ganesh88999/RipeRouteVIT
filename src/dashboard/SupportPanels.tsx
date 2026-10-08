import { Link } from "react-router-dom"
import { useTranslation } from "../i18n/LanguageProvider"

export function SupportPanels() {
  const { t, kickerClass } = useTranslation()

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section id="support" className="scroll-mt-20 border border-line bg-card p-5">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.supportTitle")}</p>
        <p className="mt-2 text-sm">RipeRoute Farmer Support AI Assistant</p>
        <p className="mt-2 text-[12px] text-ink-muted">
          Ask about farming, schemes, crop care, irrigation, markets, or next steps.
        </p>
        <Link to="/farmer-support" className="mt-4 inline-flex rounded-full border border-line px-3 py-1.5 text-[12px]">
          Open Farmer Support
        </Link>
      </section>

      <section id="schemes" className="scroll-mt-20 border border-line bg-card p-5">
        <p className={`text-[11px] text-leaf ${kickerClass}`}>{t("dash.schemesTitle")}</p>
        <p className="mt-2 text-sm">{t("dash.schemesBody")}</p>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between border-b border-line py-2">
            <dt>{t("dash.eligibility")}</dt>
            <dd>{t("dash.check")}</dd>
          </div>
          <div className="flex justify-between border-b border-line py-2">
            <dt>{t("dash.documents")}</dt>
            <dd>{t("dash.viewReqs")}</dd>
          </div>
          <div className="flex justify-between border-b border-line py-2">
            <dt>{t("dash.application")}</dt>
            <dd>{t("dash.viewSteps")}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] text-amber">{t("dash.demoSchemes")}</p>
        <Link
          to="/government-schemes"
          className="mt-4 inline-flex rounded-full border border-line px-3 py-1.5 text-[12px]"
        >
          {t("dash.askSchemes")}
        </Link>
      </section>
    </div>
  )
}
