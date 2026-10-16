import { useLayoutEffect, useRef, type CSSProperties, type Ref } from 'react'
import { wedding } from '../config/wedding'
import { dateParts, formatTime } from '../lib/date'
import { Divider, GoldFern, SageSprig } from './Botanical'

interface Props {
  ref?: Ref<HTMLElement>
  /** Starts the staggered entrance of the card's contents. */
  shown: boolean
  onContinue: () => void
}

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/**
 * Keeps the whole card readable without scrolling on short screens:
 * level 1 drops the secondary family lines (they also appear in "Wedding Details"),
 * level 2 tightens type and spacing. Anything still taller simply scrolls inside the card.
 */
function useFitToScreen() {
  const innerRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const inner = innerRef.current
    if (!inner) return
    const fit = () => {
      inner.dataset.fit = '0'
      for (const level of ['1', '2']) {
        if (inner.scrollHeight <= inner.clientHeight + 1) break
        inner.dataset.fit = level
      }
    }
    fit()
    document.fonts?.ready.then(fit)
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])
  return innerRef
}

/** The full-screen invitation revealed from the envelope — a digital echo of the printed card. */
export function InvitationCard({ ref, shown, onContinue }: Props) {
  const { blessing, hosts, groom, bride, venue, date } = wedding
  const d = dateParts(date.start)
  const innerRef = useFitToScreen()
  let i = 0

  return (
    <article
      ref={ref}
      className={`inv-card ${shown ? 'is-shown' : ''}`}
      aria-labelledby="inv-card-title"
      tabIndex={-1}
    >
      <SageSprig className="inv-card__corner inv-card__corner--tl" />
      <GoldFern className="inv-card__corner inv-card__corner--tr" />
      <GoldFern className="inv-card__corner inv-card__corner--bl" />
      <SageSprig className="inv-card__corner inv-card__corner--br" />

      <div className="inv-card__inner" ref={innerRef}>
        <h2 id="inv-card-title" className="sr-only">
          Wedding invitation: {groom.fullName} and {bride.fullName}
        </h2>

        <p className="inv-card__arabic stagger" style={stagger(i++)} lang="ar" dir="rtl">
          {blessing.arabic}
        </p>
        <p className="inv-card__caps inv-card__blessing stagger" style={stagger(i++)}>
          {blessing.translation}
        </p>
        <Divider className="inv-card__divider stagger" />

        <div className="stagger" style={stagger(i++)}>
          <p className="inv-card__italic">{hosts.intro}</p>
          <p className="inv-card__hosts">{hosts.names}</p>
          <p className="inv-card__italic">{hosts.request}</p>
        </div>

        <Divider className="inv-card__divider stagger" />

        <p className="inv-card__name stagger" style={stagger(i++)}>
          {groom.fullName}
        </p>
        <p className="inv-card__lineage stagger" style={stagger(i)}>
          ({groom.lineage})
        </p>
        <p className="inv-card__amp stagger" style={stagger(i++)} aria-hidden="true">
          &amp;
        </p>
        <p className="inv-card__name stagger" style={stagger(i++)}>
          {bride.fullName}
        </p>
        <p className="inv-card__lineage stagger" style={stagger(i++)}>
          ({bride.lineage})
        </p>

        <p className="inv-card__caps inv-card__invite stagger" style={stagger(i++)}>
          Invite you to celebrate
        </p>

        <div className="inv-card__when stagger" style={stagger(i++)}>
          <p>
            <span>{d.weekday}</span>
            <span>
              {d.day} {d.month}
            </span>
            <span>{d.year}</span>
          </p>
          <p>
            <span>{formatTime(date.start)}</span>
            <span className="inv-card__to">to</span>
            <span>{formatTime(date.end)}</span>
          </p>
          <p>
            <span>{venue.name}</span>
            <span>{venue.locality}</span>
          </p>
        </div>

        <div className="stagger" style={stagger(i++)}>
          <button type="button" className="btn btn--primary inv-card__continue" onClick={onContinue}>
            Continue to Celebration
          </button>
        </div>
      </div>
    </article>
  )
}
