/**
 * Burgundy peonies, gold leaves and gold scrollwork, generated as lightweight inline SVG.
 * Every piece is decorative (aria-hidden) and deterministic, so renders are cheap and stable.
 */
import { useId, type ReactNode } from 'react'

type Pt = [number, number]

const f = (n: number) => n.toFixed(1)

/** Small repeatable wobble so petals and leaves don't look stamped. */
const jitter = (i: number, amount: number) => Math.sin(i * 12.9898 + 4.1) * amount

function bezier(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const u = 1 - t
  const a = u * u * u, b = 3 * u * u * t, c = 3 * u * t * t, d = t * t * t
  return [a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]
}

function bezierAngle(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number) {
  const u = 1 - t
  const dx = 3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0])
  const dy = 3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1])
  return (Math.atan2(dy, dx) * 180) / Math.PI
}

type Stem = [Pt, Pt, Pt, Pt]
const stemPath = (s: Stem) => `M${s[0].join(' ')} C${s[1].join(' ')} ${s[2].join(' ')} ${s[3].join(' ')}`

/** A spiral that starts at radius r and winds inwards — the curl at the end of a scroll. */
function spiral(cx: number, cy: number, r: number, startDeg: number, dir: 1 | -1, turns = 1.25) {
  const steps = 36
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const rr = r * (1 - 0.82 * t)
    const a = ((startDeg + dir * t * turns * 360) * Math.PI) / 180
    pts.push(`${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))}`)
  }
  return `M${pts.join(' L')}`
}

/* ── Peony ─────────────────────────────────────────────────────────────── */

function petalPath(len: number, w: number) {
  return (
    `M0 0 C${f(-w)} ${f(-len * 0.25)} ${f(-w * 1.15)} ${f(-len * 0.8)} ${f(-w * 0.55)} ${f(-len * 0.97)} ` +
    `Q${f(-w * 0.2)} ${f(-len * 1.08)} 0 ${f(-len * 0.97)} Q${f(w * 0.2)} ${f(-len * 1.08)} ${f(w * 0.55)} ${f(-len * 0.97)} ` +
    `C${f(w * 1.15)} ${f(-len * 0.8)} ${f(w)} ${f(-len * 0.25)} 0 0 Z`
  )
}

const RINGS = [
  { count: 8, len: 56, w: 27, offset: 0, base: '#5c1621', tip: '#ad5965' },
  { count: 9, len: 47, w: 23, offset: 20, base: '#561420', tip: '#9e4754' },
  { count: 9, len: 38, w: 19, offset: 5, base: '#4e111b', tip: '#913c49' },
  { count: 8, len: 29, w: 15, offset: 28, base: '#460e18', tip: '#843341' },
  { count: 7, len: 20, w: 11, offset: 12, base: '#3e0b14', tip: '#762b38' },
  { count: 6, len: 12, w: 7, offset: 40, base: '#340910', tip: '#69222f' },
]

const PEONY_PETALS = RINGS.flatMap((ring, r) =>
  Array.from({ length: ring.count }, (_, i) => {
    const k = r * 17 + i
    const len = ring.len * (1 + jitter(k, 0.07))
    const w = ring.w * (1 + jitter(k + 3, 0.08))
    return {
      ring: r,
      angle: ring.offset + (i * 360) / ring.count + jitter(k + 7, 6),
      d: petalPath(len, w),
      tip: `M${f(-w * 0.5)} ${f(-len * 0.93)} Q0 ${f(-len * 1.03)} ${f(w * 0.5)} ${f(-len * 0.93)}`,
      vein: `M0 -2 Q${f(w * 0.15)} ${f(-len * 0.5)} 0 ${f(-len * 0.82)}`,
    }
  }),
)

const STAMENS = Array.from({ length: 9 }, (_, i) => {
  const a = (i / 9) * Math.PI * 2 + jitter(i, 0.3)
  const r = 4 + (i % 3) * 1.6
  return [r * Math.cos(a), r * Math.sin(a)] as Pt
})

/** A many-layered burgundy peony, centred on (0, 0) with a radius of about 60. */
function Peony({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  const id = useId()
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} filter={`url(#${id}-shadow)`}>
      <defs>
        {RINGS.map((ring, r) => (
          <linearGradient key={r} id={`${id}-r${r}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor={ring.base} />
            <stop offset="1" stopColor={ring.tip} />
          </linearGradient>
        ))}
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#3a1a10" floodOpacity=".35" />
        </filter>
      </defs>
      {PEONY_PETALS.map((p, i) => (
        <g key={i} transform={`rotate(${f(p.angle)})`}>
          <path d={p.d} fill={`url(#${id}-r${p.ring})`} stroke="#2c070c" strokeOpacity=".35" strokeWidth=".6" />
          <path d={p.vein} fill="none" stroke="#2c070c" strokeOpacity=".18" strokeWidth=".7" />
          <path d={p.tip} fill="none" stroke="#f0b8bd" strokeOpacity=".32" strokeWidth="1" strokeLinecap="round" />
        </g>
      ))}
      <circle r="6.5" fill="#2e070d" />
      {STAMENS.map(([sx, sy], i) => (
        <circle key={i} cx={f(sx)} cy={f(sy)} r="1.1" fill="#c9a35f" />
      ))}
    </g>
  )
}

/** A closed peony bud on a short stem. */
function Bud({ x, y, scale = 1, rotate = 0 }: { x: number; y: number; scale?: number; rotate?: number }) {
  const id = useId()
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <defs>
        <radialGradient id={`${id}-bud`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#a54c58" />
          <stop offset="1" stopColor="#4a0f18" />
        </radialGradient>
      </defs>
      <path d="M0 0 C 2 10, 1 22, -2 34" fill="none" stroke="#8a6a35" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M0 -18 C 11 -14, 13 -2, 0 4 C -13 -2, -11 -14, 0 -18 Z" fill={`url(#${id}-bud)`} />
      <path d="M-2 -17 C 4 -12, 5 -4, 0 3" fill="none" stroke="#2c070c" strokeOpacity=".35" strokeWidth=".7" />
      <path d="M0 4 C -9 2, -12 -6, -10 -12 C -6 -6, -3 -2, 0 0 Z" fill="#b8945a" />
      <path d="M0 4 C 9 2, 12 -6, 10 -12 C 6 -6, 3 -2, 0 0 Z" fill="#a8844c" />
    </g>
  )
}

/* ── Leaves and fern ───────────────────────────────────────────────────── */

const LEAF = 'M0 0 C .22 -.24 .66 -.28 1 0 C .66 .28 .22 .24 0 0 Z'

function GoldLeaf({ x, y, angle, length, gradient }: { x: number; y: number; angle: number; length: number; gradient: string }) {
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(angle)}) scale(${f(length)})`}>
      <path d={LEAF} fill={`url(#${gradient})`} />
      <path d="M.03 0 L.9 0" stroke="#f6ead0" strokeWidth=".8" vectorEffect="non-scaling-stroke" opacity=".7" />
    </g>
  )
}

function leavesAlong(stem: Stem, count: number, baseLength: number, spread: number) {
  return Array.from({ length: count + 1 }, (_, i) => {
    const last = i === count
    const t = last ? 1 : 0.12 + (i * 0.82) / count
    const [x, y] = bezier(...stem, t)
    const side = i % 2 === 0 ? 1 : -1
    return {
      x,
      y,
      angle: bezierAngle(...stem, t) + (last ? 0 : side * spread),
      length: baseLength * (last ? 0.55 : 1 - t * 0.45),
    }
  })
}

/** Fine gold line-art fern. */
function Fern({ stem, count, size }: { stem: Stem; count: number; size: number }) {
  return (
    <g>
      <path d={stemPath(stem)} fill="none" stroke="var(--gold)" strokeWidth="1.1" strokeLinecap="round" />
      {leavesAlong(stem, count, size, 42).map((l, i) => (
        <g key={i} transform={`translate(${f(l.x)} ${f(l.y)}) rotate(${f(l.angle)}) scale(${f(l.length)})`}>
          <path d={LEAF} fill="var(--gold)" fillOpacity=".18" stroke="var(--gold)" strokeWidth=".9" vectorEffect="non-scaling-stroke" />
          <path d="M0 0 L.8 0" stroke="var(--gold)" strokeWidth=".5" vectorEffect="non-scaling-stroke" opacity=".7" />
        </g>
      ))}
    </g>
  )
}

const BOUQUET_LEAVES = [
  { x: 120, y: 60, angle: -18, length: 70 },
  { x: 140, y: 100, angle: 14, length: 74 },
  { x: 130, y: 140, angle: 48, length: 66 },
  { x: 95, y: 160, angle: 78, length: 70 },
  { x: 55, y: 150, angle: 112, length: 58 },
  { x: 60, y: 32, angle: -60, length: 48 },
  { x: 40, y: 268, angle: 40, length: 52 },
  { x: 48, y: 230, angle: -10, length: 46 },
]

/**
 * Corner arrangement of peonies, buds, gold leaves and ferns.
 * Drawn for the top-left corner; CSS mirrors it for the bottom-right.
 */
export function Bouquet({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg className={className} viewBox="0 0 320 320" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2cc98" />
          <stop offset="1" stopColor="#9a7741" />
        </linearGradient>
      </defs>
      <Fern stem={[[150, 40], [200, 22], [250, 18], [312, 8]]} count={11} size={26} />
      <Fern stem={[[40, 170], [26, 220], [20, 260], [8, 314]]} count={11} size={26} />
      {BOUQUET_LEAVES.map((l, i) => (
        <GoldLeaf key={i} {...l} gradient={`${id}-leaf`} />
      ))}
      <Bud x={222} y={66} rotate={-130} scale={1.15} />
      <Bud x={176} y={146} rotate={-120} scale={0.85} />
      <Bud x={92} y={262} rotate={-160} scale={0.9} />
      <Peony x={18} y={232} scale={0.72} rotate={30} />
      <Peony x={86} y={100} scale={1.3} rotate={8} />
    </svg>
  )
}

/* ── Gold scrollwork ───────────────────────────────────────────────────── */

const SCROLL_HALF = [
  'M0 46 C 10 46, 16 40, 20 32',
  spiral(26, 30, 7, 180, 1),
  'M4 50 C 22 58, 46 52, 54 38',
  spiral(47, 34, 8, 0, -1),
  'M54 38 C 62 26, 80 22, 96 26 L 150 26',
  'M58 44 C 74 50, 92 44, 104 36',
  spiral(110, 38, 6, 200, 1),
  'M30 22 C 34 12, 44 6, 56 8',
  spiral(60, 14, 6, 270, 1, 1.1),
].join(' ')

/** Symmetrical gold cartouche for the top and bottom of the frame. */
export function Flourish({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-150 0 300 70" aria-hidden="true" focusable="false">
      <g fill="none" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d={SCROLL_HALF} />
        <path d={SCROLL_HALF} transform="scale(-1 1)" />
      </g>
      <path d="M0 6 C 7 16, 7 28, 0 38 C -7 28, -7 16, 0 6 Z" fill="var(--gold)" fillOpacity=".35" stroke="var(--gold)" strokeWidth="1.2" />
      <circle cx="0" cy="45" r="3" fill="var(--burgundy)" fillOpacity=".75" />
      <path d="M0 50 C 3 55, 3 60, 0 65 C -3 60, -3 55, 0 50 Z" fill="var(--gold)" />
    </svg>
  )
}

const CORNER = [
  'M4 4 L 130 4',
  'M4 4 L 4 130',
  'M10 10 C 30 10, 40 20, 40 36',
  spiral(32, 40, 8, 0, 1),
  'M10 10 C 10 30, 20 40, 36 40',
  'M40 22 C 56 14, 76 14, 90 22',
  spiral(94, 30, 7, 270, 1),
  'M22 40 C 14 56, 14 76, 22 90',
  spiral(30, 94, 7, 180, -1),
].join(' ')

/** Gold corner scroll for the two corners without flowers. Drawn for the top-left corner. */
export function CornerScroll({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 140 140" aria-hidden="true" focusable="false">
      <path d={CORNER} fill="none" stroke="var(--gold)" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14 14 C 22 18, 24 24, 20 30 C 14 26, 12 20, 14 14 Z" fill="var(--gold)" fillOpacity=".5" />
    </svg>
  )
}

/** Thin divider: line · diamond · line. */
export function Divider({ className }: { className?: string }) {
  return (
    <svg className={`divider ${className ?? ''}`} viewBox="0 0 240 16" aria-hidden="true" focusable="false">
      <path d="M0 8 H104" stroke="currentColor" strokeWidth=".8" />
      <path d="M136 8 H240" stroke="currentColor" strokeWidth=".8" />
      <path d="M120 1 L 124 8 L 120 15 L 116 8 Z" fill="currentColor" />
    </svg>
  )
}

/* ── Icons ─────────────────────────────────────────────────────────────── */

function Icon({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  )
}

export const CalendarIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </Icon>
)

export const ClockIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </Icon>
)

export const PinIcon = ({ className }: { className?: string }) => (
  <Icon className={className}>
    <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.8" r="2.3" />
  </Icon>
)

export const NoteIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M10 17.5V5.5l8-2v3l-6 1.5v9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <ellipse cx="7.5" cy="17.8" rx="3" ry="2.4" fill="currentColor" />
  </svg>
)
