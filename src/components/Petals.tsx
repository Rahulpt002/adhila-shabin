import type { CSSProperties } from 'react'

/** Pre-computed so every render is identical; pure CSS animation, composited (transform/opacity only). */
const PETALS = Array.from({ length: 12 }, (_, i) => {
  const seed = (i * 7919) % 101
  return {
    x: (i * 37 + seed * 0.6) % 100,
    delay: -((i * 1.9) % 14),
    duration: 13 + (seed % 7),
    drift: 18 + (seed % 30),
    size: 8 + (seed % 7),
    tone: i % 3,
  }
})

/** Slowly drifting petals. Hidden entirely under prefers-reduced-motion (see CSS). */
export function Petals({ count = 12, className }: { count?: number; className?: string }) {
  return (
    <div className={`petals ${className ?? ''}`} aria-hidden="true">
      {PETALS.slice(0, count).map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              '--x': `${p.x}%`,
              '--delay': `${p.delay}s`,
              '--dur': `${p.duration}s`,
              '--drift': `${p.drift}px`,
              '--size': `${p.size}px`,
            } as CSSProperties
          }
        >
          <span className={`petal__shape petal__shape--${p.tone}`} />
        </span>
      ))}
    </div>
  )
}
