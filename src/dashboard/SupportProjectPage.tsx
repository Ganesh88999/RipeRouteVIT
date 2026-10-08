import { motion, useReducedMotion } from "framer-motion"
import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { useTranslation } from "../i18n/LanguageProvider"

/** Actual UPI VPA — do not change without verifying the account owner. */
export const UPI_ID = "hemanthkumarvenkatasamy-1@okhdfcbank"

/** Payee display name shown in UPI apps (matches the account holder). */
export const UPI_PAYEE_NAME = "Hemanth Kumar"

/**
 * Standard UPI payment deep link (no fixed amount — payer enters donation amount).
 * Must begin with upi://pay? and include pa=<UPI_ID>.
 */
export function buildUpiPayUri() {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: UPI_PAYEE_NAME,
    cu: "INR",
  })
  return `upi://pay?${params.toString()}`
}

export function SupportProjectPage() {
  const reduce = useReducedMotion()
  const { t } = useTranslation()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [encodedUri, setEncodedUri] = useState("")

  useEffect(() => {
    let cancelled = false
    const uri = buildUpiPayUri()
    setEncodedUri(uri)
    console.log("[RIPE UPI] QR payload", uri)
    void QRCode.toDataURL(uri, {
      margin: 2,
      width: 280,
      color: { dark: "#123c2e", light: "#fffcf6" },
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function copyId() {
    try {
      await navigator.clipboard.writeText(UPI_ID)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-card mx-auto max-w-lg p-5 sm:p-6"
    >
      <div>
        <p className="text-[11px] tracking-[0.16em] uppercase text-leaf">
          {t("dash.navSupportProject")}
        </p>
        <h1 className="font-display mt-2 text-2xl">{t("dash.donateTitle")}</h1>
        <p className="mt-2 text-sm text-ink-muted">{t("dash.supportScanHint")}</p>
        <p className="mt-3 text-[11px] tracking-[0.14em] uppercase text-ink-muted">UPI ID</p>
        <p className="mt-1 break-all font-medium">{UPI_ID}</p>
        <p className="mt-2 text-[12px] text-ink-muted">{t("dash.supportVerify")}</p>
        <p className="mt-2 text-[12px] text-ink-muted">{t("dash.supportNoAutoVerify")}</p>
      </div>

      <div className="mt-5 flex flex-col items-center">
        {qrDataUrl ? (
          <motion.img
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            src={qrDataUrl}
            alt={`UPI payment QR encoding ${encodedUri}`}
            className="h-64 w-64 rounded-md border border-line bg-card p-2 sm:h-72 sm:w-72"
            data-upi-uri={encodedUri}
          />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-md border border-line text-sm text-ink-muted">
            {t("dash.supportGeneratingQr")}
          </div>
        )}
        <p className="mt-3 text-sm text-ink-muted">{t("dash.supportScanAny")}</p>
      </div>

      <button type="button" className="dash-btn dash-btn-primary mt-5 w-full" onClick={() => void copyId()}>
        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
        {copied ? t("dash.supportCopied") : t("dash.supportCopy")}
      </button>
    </motion.div>
  )
}
