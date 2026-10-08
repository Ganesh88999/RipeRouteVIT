import { motion, useReducedMotion } from "framer-motion"
import { useId } from "react"
import { cinematicEase } from "../motion"

type NetworkNode = {
  id: string
  label: string
}

type AINetworkProps = {
  nodes: readonly NetworkNode[]
  activeIndex: number
  status?: string
  compact?: boolean
  className?: string
}

export function AINetwork({
  nodes,
  activeIndex,
  status,
  compact = false,
  className = "",
}: AINetworkProps) {
  const reduce = useReducedMotion()
  const glowId = `rr-glow-${useId().replace(/:/g, "")}`
  const width = 440
  const top = 28
  const gap = compact ? 58 : 72
  const height = top + gap * (nodes.length - 1) + 28
  const cx = 36

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="RipeRoute AI network, coordinating farm intelligence through rescue"
      >
        <defs>
          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="1.6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {nodes.map((node, index) => {
          const y1 = top + gap * index
          const y2 = top + gap * (index + 1)
          if (index === nodes.length - 1) return null
          const lit = index < activeIndex
          const carrying = index === activeIndex
          const d = `M ${cx} ${y1 + 10} L ${cx} ${y2 - 10}`
          return (
            <g key={`${node.id}-link`}>
              <motion.path
                d={d}
                fill="none"
                stroke={lit || carrying ? "rgba(61,204,122,0.45)" : "rgba(255,255,255,0.16)"}
                strokeWidth={carrying ? 1.6 : 1}
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.55, delay: 0.08 + index * 0.08, ease: cinematicEase }}
              />
              {!reduce && (carrying || lit) ? (
                <motion.circle
                  r={carrying ? 3 : 2}
                  fill={carrying ? "#3dcc7a" : "#1f6b45"}
                  cx={cx}
                  filter={carrying ? `url(#${glowId})` : undefined}
                  animate={{ cy: [y1 + 12, y2 - 12], opacity: [0.15, 1, 0.2] }}
                  transition={{
                    duration: carrying ? 1.15 : 2.2,
                    delay: carrying ? 0 : index * 0.2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              ) : null}
            </g>
          )
        })}

        {nodes.map((node, index) => {
          const y = top + gap * index
          const active = index === activeIndex
          const done = index < activeIndex
          return (
            <g key={node.id}>
              {active && !reduce ? (
                <motion.circle
                  cx={cx}
                  cy={y}
                  r="12"
                  fill="none"
                  stroke="#3dcc7a"
                  strokeWidth="1"
                  animate={{ opacity: [0.15, 0.7, 0.15], scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: `${cx}px ${y}px` }}
                />
              ) : null}
              <motion.circle
                cx={cx}
                cy={y}
                r={active ? 6.4 : 5.2}
                fill={active || done ? "#1f6b45" : "#0a241c"}
                stroke={active ? "#d4a017" : done ? "#3dcc7a" : "rgba(255,255,255,0.4)"}
                strokeWidth="1.2"
                filter={active ? `url(#${glowId})` : undefined}
                initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: active ? 1.12 : 1 }}
                transition={{ duration: 0.35, delay: index * 0.06, ease: cinematicEase }}
                style={{ transformOrigin: `${cx}px ${y}px` }}
              />
              <motion.text
                x={52}
                y={y + 4}
                fill={active ? "#ffffff" : done ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.55)"}
                fontSize={compact ? 11 : 12}
                style={{ fontFamily: "inherit" }}
                initial={reduce ? false : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.06 + index * 0.06, ease: cinematicEase }}
              >
                {node.label}
              </motion.text>
            </g>
          )
        })}
      </svg>
      {status ? (
        <motion.p
          key={status}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs leading-snug text-leaf"
        >
          {status}
        </motion.p>
      ) : null}
    </div>
  )
}
