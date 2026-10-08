import { useInView, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

type CountUpProps = {
  target: number
  prefix?: string
  suffix?: string
  durationMs?: number
}

function formatValue(value: number) {
  return Math.round(value).toLocaleString("en-IN")
}

export function CountUp({
  target,
  prefix = "",
  suffix = "",
  durationMs = 1400,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduce = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView || reduce) return

    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      setValue(target * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [durationMs, inView, reduce, target])

  const display = reduce ? target : value

  return (
    <span ref={ref}>
      {prefix}
      {formatValue(display)}
      {suffix}
    </span>
  )
}
