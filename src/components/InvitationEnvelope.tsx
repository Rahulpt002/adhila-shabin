import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { wedding } from '../config/wedding'
import { usePrefersReducedMotion } from '../lib/hooks'
import { GoldFern, SageSprig, WaxSeal } from './Botanical'
import { InvitationCard } from './InvitationCard'
import { Petals } from './Petals'

/**
 * Opening sequence, driven by timers (not animationend events) so it can never get stuck:
 *   sealed → unsealing (seal cracks) → flap (flap swings open) → rising (card slides out)
 *   → expanding (card grows to full screen) → card (contents fade in) → leaving → onDone
 */
export type Stage = 'sealed' | 'unsealing' | 'flap' | 'rising' | 'expanding' | 'card' | 'leaving'

const TIMELINE: [Stage, number][] = [
  ['flap', 450],
  ['rising', 1150],
  ['expanding', 2000],
  ['card', 2650],
]

const EXPAND_MS = 850

interface Props {
  onDone: () => void
}

export function InvitationEnvelope({ onDone }: Props) {
  const [stage, setStage] = useState<Stage>('sealed')
  const [leftFromCard, setLeftFromCard] = useState(false)
  const reducedMotion = usePrefersReducedMotion()
  const started = useRef(false)
  const timers = useRef<number[]>([])
  const miniCardRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLElement>(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  // Lock page scroll behind the invitation.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('is-locked')
    return () => root.classList.remove('is-locked')
  }, [])

  const open = useCallback(() => {
    if (started.current) return // ignore double taps / repeated key presses
    started.current = true
    if (reducedMotion) {
      setStage('card')
      return
    }
    setStage('unsealing')
    for (const [next, at] of TIMELINE) {
      timers.current.push(window.setTimeout(() => setStage(next), at))
    }
  }, [reducedMotion])

  const leave = useCallback(
    (fast = false) => {
      clearTimers()
      started.current = true
      setLeftFromCard(stage === 'expanding' || stage === 'card')
      setStage('leaving')
      timers.current.push(window.setTimeout(onDone, reducedMotion || fast ? 250 : 650))
    },
    [onDone, reducedMotion, stage],
  )

  // FLIP: grow the full card out of the small card sitting in the envelope.
  useLayoutEffect(() => {
    if (stage !== 'expanding') return
    const from = miniCardRef.current?.getBoundingClientRect()
    const card = cardRef.current
    if (!from || !card || typeof card.animate !== 'function') return
    const to = card.getBoundingClientRect()
    if (!to.width || !to.height) return
    const dx = from.left - to.left
    const dy = from.top - to.top
    card.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: 0.6 },
        { opacity: 1, offset: 0.3 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: EXPAND_MS, easing: 'cubic-bezier(.2,.75,.2,1)' },
    )
  }, [stage])

  // Move focus into the card once it is readable, so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (stage === 'card') cardRef.current?.focus({ preventScroll: true })
  }, [stage])

  const opening = stage !== 'sealed'
  const cardMounted = stage === 'expanding' || stage === 'card' || (stage === 'leaving' && leftFromCard)
  const showSkip = stage !== 'card' && stage !== 'leaving'

  return (
    <div
      className="envelope-scene"
      data-stage={stage}
      role="dialog"
      aria-modal="true"
      aria-label={`Wedding invitation from ${wedding.hosts.names}`}
    >
      <SageSprig className="scene-corner scene-corner--tl" />
      <GoldFern className="scene-corner scene-corner--tr" />
      <GoldFern className="scene-corner scene-corner--bl" />
      <SageSprig className="scene-corner scene-corner--br" />
      <Petals />

      <div className="envelope-stage">
        <p className="envelope-tagline">{wedding.envelope.tagline}</p>

        <div className="envelope-wrap">
          <div className="envelope-glow" aria-hidden="true" />
          {/* The envelope itself is a large tap target; the labelled button below is the accessible control. */}
          <div className="envelope" onClick={open} aria-hidden="true">
            <div className="envelope__back" />

            <div className="envelope__flap">
              <svg className="envelope__flap-face envelope__flap-face--outer" viewBox="0 0 300 200" preserveAspectRatio="none">
                <path d="M0 0 H300 L158 114 Q150 120 142 114 Z" fill="url(#env-flap)" />
                <path d="M0 0 L142 114 Q150 120 158 114 L300 0" fill="none" stroke="#d8c8ac" strokeWidth=".8" />
              </svg>
              <svg className="envelope__flap-face envelope__flap-face--inner" viewBox="0 0 300 200" preserveAspectRatio="none">
                <path d="M0 200 H300 L158 86 Q150 80 142 86 Z" fill="url(#env-liner)" />
              </svg>
            </div>

            <div className="envelope__card" ref={miniCardRef}>
              <div className="mini-card">
                <span className="mini-card__eyebrow">Together with their families</span>
                <span className="mini-card__names">
                  {wedding.groom.firstName} <em>&amp;</em> {wedding.bride.firstName}
                </span>
              </div>
            </div>

            <svg className="envelope__front" viewBox="0 0 300 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="env-flap" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#f3ebdc" />
                  <stop offset="1" stopColor="#e8dcc6" />
                </linearGradient>
                <linearGradient id="env-side" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#efe5d3" />
                  <stop offset="1" stopColor="#e6d9c2" />
                </linearGradient>
                <linearGradient id="env-bottom" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stopColor="#f1e8d8" />
                  <stop offset="1" stopColor="#e9ddc8" />
                </linearGradient>
                <pattern id="env-liner-dots" width="14" height="14" patternUnits="userSpaceOnUse">
                  <path d="M7 2 C 9 5 9 9 7 12 C 5 9 5 5 7 2 Z" fill="#c9b07a" opacity=".55" />
                </pattern>
                <linearGradient id="env-liner-bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#a9c2b4" />
                  <stop offset="1" stopColor="#8eae9e" />
                </linearGradient>
                <pattern id="env-liner" width="300" height="200" patternUnits="userSpaceOnUse">
                  <rect width="300" height="200" fill="url(#env-liner-bg)" />
                  <rect width="300" height="200" fill="url(#env-liner-dots)" />
                </pattern>
              </defs>
              <path d="M0 0 L146 108 Q150 111 146 114 L0 200 Z" fill="url(#env-side)" />
              <path d="M300 0 L154 108 Q150 111 154 114 L300 200 Z" fill="url(#env-side)" />
              <path d="M0 200 L142 98 Q150 92 158 98 L300 200 Z" fill="url(#env-bottom)" />
              <path d="M0 200 L142 98 Q150 92 158 98 L300 200" fill="none" stroke="#d6c5a8" strokeWidth=".8" />
            </svg>

            <p className="envelope__address">
              <span className="envelope__address-names">
                {wedding.groom.firstName} &amp; {wedding.bride.firstName}
              </span>
            </p>

            <div className="seal">
              <div className="seal__half seal__half--left">
                <WaxSeal />
              </div>
              <div className="seal__half seal__half--right">
                <WaxSeal />
              </div>
            </div>
          </div>
        </div>

        <div className="envelope-actions">
          <button type="button" className="btn btn--primary btn--open" onClick={open} disabled={opening}>
            {wedding.envelope.openLabel}
          </button>
        </div>
      </div>

      {cardMounted && (
        <div className="inv-card-layer">
          <InvitationCard ref={cardRef} shown={stage === 'card' || stage === 'leaving'} onContinue={() => leave()} />
        </div>
      )}

      {showSkip && (
        <button type="button" className="skip-btn" onClick={() => leave(true)}>
          Skip animation
        </button>
      )}
    </div>
  )
}
