import { useEffect, useRef, useState } from "react"
import { useTranslation } from "../i18n/LanguageProvider"

const MAX_BYTES = 5_500_000
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]

export type CropPhoto = {
  dataUrl: string
  mimeType: string
  name: string
}

export function CropPhotoCapture({
  photo,
  onChange,
}: {
  photo: CropPhoto | null
  onChange: (photo: CropPhoto | null) => void
}) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<"idle" | "camera">("idle")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    return () => stopStream()
  }, [])

  useEffect(() => {
    if (mode !== "camera") return
    const video = videoRef.current
    if (video && streamRef.current) {
      video.srcObject = streamRef.current
      void video.play().catch(() => undefined)
    }
  }, [mode])

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const onFile = async (file: File | undefined) => {
    setError(null)
    if (!file) return
    if (!TYPES.includes(file.type)) {
      setError(t("dash.invalidImageType"))
      return
    }
    if (file.size > MAX_BYTES) {
      setError(t("dash.imageTooLarge"))
      return
    }
    const dataUrl = await readFile(file)
    onChange({ dataUrl, mimeType: file.type === "image/jpg" ? "image/jpeg" : file.type, name: file.name })
    setMode("idle")
  }

  const takePhoto = async () => {
    setError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t("dash.cameraUnavailable"))
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      setMode("camera")
    } catch (err) {
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")
      setError(denied ? t("dash.cameraDenied") : t("dash.cameraUnavailable"))
      setMode("idle")
    }
  }

  const capture = () => {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL("image/jpeg", 0.88)
    stopStream()
    setMode("idle")
    onChange({ dataUrl, mimeType: "image/jpeg", name: "capture.jpg" })
  }

  const cancelCamera = () => {
    stopStream()
    setMode("idle")
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />

      {mode === "camera" ? (
        <div className="overflow-hidden border border-line bg-ink">
          <video ref={videoRef} className="aspect-video w-full bg-ink object-cover" playsInline muted autoPlay />
          <div className="flex flex-wrap gap-2 bg-card p-3">
            <button type="button" className="dash-btn dash-btn-primary" onClick={capture}>
              {t("dash.capturePhoto")}
            </button>
            <button type="button" className="dash-btn" onClick={cancelCamera}>
              {t("dash.cancelCamera")}
            </button>
          </div>
        </div>
      ) : photo ? (
        <div className="overflow-hidden border border-line">
          <img src={photo.dataUrl} alt="" className="max-h-72 w-full object-contain bg-canvas-warm" />
          <p className="px-3 py-2 text-[12px] text-ink-muted">{photo.name}</p>
        </div>
      ) : (
        <div className="flex min-h-40 items-center justify-center border border-dashed border-line bg-canvas-warm text-sm text-ink-muted">
          {t("dash.noPhotoYet")}
        </div>
      )}

      {error ? <p className="text-sm text-urgent">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="dash-btn" onClick={() => fileRef.current?.click()}>
          {t("dash.uploadPhoto")}
        </button>
        {mode !== "camera" ? (
          <button type="button" className="dash-btn dash-btn-primary" onClick={() => void takePhoto()}>
            {t("dash.takePhoto")}
          </button>
        ) : null}
        {photo ? (
          <button
            type="button"
            className="dash-btn"
            onClick={() => {
              onChange(null)
              if (fileRef.current) fileRef.current.value = ""
            }}
          >
            {t("dash.retakePhoto")}
          </button>
        ) : null}
      </div>
    </div>
  )
}

function readFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
