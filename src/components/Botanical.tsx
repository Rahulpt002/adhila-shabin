/**
 * Hand-drawn style botanical illustrations, generated as lightweight inline SVG.
 * Every piece is decorative (aria-hidden) and deterministic, so renders are cheap and stable.
 */
import { useId, type CSSProperties } from 'react'
import { wedding } from '../config/wedding'

type Pt = [number, number]

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

interface Leaf {
  x: number
  y: number
  angle: number
  length: number
}

function leavesAlong(stem: [Pt, Pt, Pt, Pt], count: number, baseLength: number, spread: number): Leaf[] {
  const leaves: Leaf[] = []
  for (let i = 0; i < count; i++) {
    const t = 0.1 + (i * 0.84) / count
    const [x, y] = bezier(...stem, t)
    const side = i % 2 === 0 ? 1 : -1
    leaves.push({
      x,
      y,
      angle: bezierAngle(...stem, t) + side * spread,
      length: baseLength * (1 - t * 0.42),
    })
  }
  const [x, y] = bezier(...stem, 1)
  leaves.push({ x, y, angle: bezierAngle(...stem, 1), length: baseLength * 0.55 })
  return leaves
}

const SAGE_LEAF = 'M0 0 C .22 -.34 .7 -.38 1 0 C .7 .38 .22 .34 0 0 Z'
const GOLD_LEAF = 'M0 0 C .28 -.13 .74 -.15 1 0 C .74 .15 .28 .13 0 0 Z'

const SAGE_STEM: [Pt, Pt, Pt, Pt] = [[18, 250], [40, 170], [90, 90], [178, 22]]
const SAGE_LEAVES = leavesAlong(SAGE_STEM, 10, 62, 52)

const GOLD_STEM: [Pt, Pt, Pt, Pt] = [[20, 252], [60, 180], [100, 100], [172, 16]]
const GOLD_LEAVES = leavesAlong(GOLD_STEM, 14, 70, 38)

const stemPath = (s: [Pt, Pt, Pt, Pt]) => `M${s[0].join(' ')} C${s[1].join(' ')} ${s[2].join(' ')} ${s[3].join(' ')}`

interface DecorProps {
  className?: string
  style?: CSSProperties
}

/** Watercolour-like sage eucalyptus sprig (as in the top-left of the printed card). */
export function SageSprig({ className, style }: DecorProps) {
  const id = useId()
  return (
    <svg className={className} style={style} viewBox="0 0 200 260" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-leaf`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b9d0c3" />
          <stop offset="1" stopColor="#7fa392" />
        </linearGradient>
      </defs>
      <path d={stemPath(SAGE_STEM)} fill="none" stroke="#86a597" strokeWidth="1.6" strokeLinecap="round" />
      {SAGE_LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.angle.toFixed(1)}) scale(${l.length.toFixed(1)})`}>
          <path d={SAGE_LEAF} fill={`url(#${id}-leaf)`} opacity={0.78 + (i % 3) * 0.07} />
          <path d="M.04 0 L.86 0" stroke="#e9f0eb" strokeWidth="1" vectorEffect="non-scaling-stroke" opacity=".7" />
        </g>
      ))}
    </svg>
  )
}

/** Fine gold line-art fern (as in the top-right of the printed card). */
export function GoldFern({ className, style }: DecorProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 200 260" aria-hidden="true" focusable="false">
      <path d={stemPath(GOLD_STEM)} fill="none" stroke="var(--gold)" strokeWidth="1.1" strokeLinecap="round" />
      {GOLD_LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.angle.toFixed(1)}) scale(${l.length.toFixed(1)})`}>
          <path d={GOLD_LEAF} fill="none" stroke="var(--gold)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M0 0 L.8 0" stroke="var(--gold)" strokeWidth=".6" vectorEffect="non-scaling-stroke" opacity=".7" />
        </g>
      ))}
    </svg>
  )
}

/** Small dusty-rose blossom, used as an accent. */
export function Blossom({ className, style }: DecorProps) {
  return (
    <svg className={className} style={style} viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="0" cy="-22" rx="17" ry="24" transform={`rotate(${a})`} fill="var(--rose)" opacity=".82" />
      ))}
      {[36, 108, 180, 252, 324].map((a) => (
        <ellipse key={a} cx="0" cy="-13" rx="10" ry="14" transform={`rotate(${a})`} fill="#e9c9c1" />
      ))}
      <circle r="6" fill="var(--gold)" />
    </svg>
  )
}

/** Thin ornamental divider: line · leaf · line. */
export function Divider({ className }: { className?: string }) {
  return (
    <svg className={`divider ${className ?? ''}`} viewBox="0 0 240 16" aria-hidden="true" focusable="false">
      <path d="M0 8 H100" stroke="currentColor" strokeWidth=".8" />
      <path d="M140 8 H240" stroke="currentColor" strokeWidth=".8" />
      <path d="M108 8 C 114 2 126 2 132 8 C 126 14 114 14 108 8 Z" fill="none" stroke="currentColor" strokeWidth=".9" />
      <circle cx="104" cy="8" r="1.4" fill="currentColor" />
      <circle cx="136" cy="8" r="1.4" fill="currentColor" />
    </svg>
  )
}

/** A slightly irregular circle, like poured wax. */
const WAX_EDGE = (() => {
  const pts: string[] = []
  const n = 72
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    const r = 55 + 2.6 * Math.sin(a * 9) + 1.4 * Math.sin(a * 23 + 1.3) + 1.1 * Math.cos(a * 5)
    pts.push(`${(60 + r * Math.cos(a)).toFixed(2)} ${(60 + r * Math.sin(a)).toFixed(2)}`)
  }
  return `M${pts.join(' L')} Z`
})()

/** Burgundy wax seal pressed with the couple's monogram. */
export function WaxSeal({ className }: { className?: string }) {
  const id = useId()
  const { left, right } = wedding.monogram
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={`${id}-wax`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#9a3b4a" />
          <stop offset=".55" stopColor="var(--burgundy)" />
          <stop offset="1" stopColor="#47161f" />
        </radialGradient>
        <radialGradient id={`${id}-press`} cx="50%" cy="50%" r="50%">
          <stop offset=".78" stopColor="#5a1f2a" />
          <stop offset="1" stopColor="#7e3341" />
        </radialGradient>
      </defs>
      <path d={WAX_EDGE} fill={`url(#${id}-wax)`} />
      <circle cx="60" cy="60" r="40" fill={`url(#${id}-press)`} />
      <circle cx="60" cy="60" r="40" fill="none" stroke="#b5636f" strokeWidth="1.2" opacity=".75" />
      <circle cx="60" cy="60" r="35" fill="none" stroke="#3d1219" strokeWidth=".8" opacity=".6" strokeDasharray="1.5 2.5" />
      <text
        x="60"
        y="69"
        textAnchor="middle"
        fontFamily="var(--font-script)"
        fontSize="30"
        fill="#e8c7b8"
        stroke="#3d1219"
        strokeWidth=".4"
        paintOrder="stroke"
      >
        {left}
        <tspan fontSize="20" dx="2" dy="-2" fill="#d79f9f">&amp;</tspan>
        <tspan dx="2" dy="2">{right}</tspan>
      </text>
      <path d="M38 83 C 46 90 74 90 82 83" fill="none" stroke="#c98d93" strokeWidth=".9" opacity=".8" />
      <ellipse cx="42" cy="36" rx="12" ry="6" fill="#fff" opacity=".12" transform="rotate(-35 42 36)" />
    </svg>
  )
}

/** Monogram wordmark for the navigation bar. */
export function Monogram({ className }: { className?: string }) {
  return (
    <span className={`monogram ${className ?? ''}`} aria-hidden="true">
      {wedding.monogram.left}
      <span className="monogram__amp">&amp;</span>
      {wedding.monogram.right}
    </span>
  )
}
