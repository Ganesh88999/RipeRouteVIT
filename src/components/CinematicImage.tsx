import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type Reveal = "center" | "left" | "right" | "up" | "hero"

type CinematicImageProps = {
  src: string
  alt: string
  className?: string
  priority?: boolean
  overlay?: "dark" | "soft" | "none"
  drift?: boolean
  clipReveal?: boolean
  reveal?: Reveal
}

const clipFrom: Record<Reveal, string> = {
  center: "inset(12% 10% 12% 10%)",
  left: "inset(0% 58% 0% 0%)",
  right: "inset(0% 0% 0% 58%)",
  up: "inset(42% 0% 0% 0%)",
  hero: "inset(14% 8% 22% 8%)",
}

export function CinematicImage({
  src,
  alt,
  className = "",
  priority = false,
  overlay = "none",
  drift = false,
  clipReveal = false,
  reveal = "center",
}: CinematicImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const [live, setLive] = useState(false)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-5%", "5%"])
  const useClip = clipReveal || reveal === "hero"

  useEffect(() => {
    if (reduce || !drift) return
    const id = window.setTimeout(() => setLive(true), reveal === "hero" ? 1000 : 400)
    return () => window.clearTimeout(id)
  }, [drift, reduce, reveal])

  return (
    <div ref={ref} className={`relative overflow-hidden bg-forest-deep ${className}`}>
      <motion.div
        className="absolute inset-0"
        initial={
          reduce || !useClip
            ? false
            : { clipPath: clipFrom[reveal], opacity: 0.78 }
        }
        whileInView={
          reduce || !useClip
            ? undefined
            : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
        }
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: reveal === "hero" ? 0.95 : 1.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.img
          src={src}
          alt={alt}
          initial={reduce ? false : { scale: reveal === "hero" ? 1.12 : 1.08, opacity: 0.62 }}
          whileInView={
            reduce || (drift && live)
              ? undefined
              : { scale: 1.02, opacity: 1 }
          }
          viewport={{ once: true, amount: 0.2 }}
          animate={
            reduce || !drift || !live
              ? undefined
              : { opacity: 1, scale: [1.02, 1.05, 1.02], x: ["0%", "1.1%", "0%"] }
          }
          transition={
            drift && live && !reduce
              ? { duration: 28, repeat: Infinity, ease: "linear" }
              : { duration: 0.95, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ y }}
          className={`landing-parallax-img absolute inset-x-0 -top-[10%] h-[120%] w-full object-cover ${
            drift ? "landing-kenburns" : ""
          }`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
        />
      </motion.div>
      {overlay === "dark" ? (
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,60,42,0.58)_0%,rgba(12,36,28,0.22)_40%,rgba(12,36,28,0.74)_100%)]" />
      ) : null}
      {overlay === "soft" ? (
        <div className="absolute inset-0 bg-ink/25" />
      ) : null}
    </div>
  )
}
