import type { CSSProperties } from 'react'
import { wedding } from '../config/wedding'
import { dateParts, formatTime } from '../lib/date'
import { Frame } from './Frame'
import { Divider } from './Ornaments'

interface Props {
  leaving: boolean
  onOpen: () => void
}

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

/** Page 1: the cover. Tapping "Open Invitation" starts the song and reveals the invitation. */
export function CoverPage({ leaving, onOpen }: Props) {
  const { cover, groom, bride, date } = wedding
  const d = dateParts(date.start)
  let i = 0

  return (
    <section className={`page cover ${leaving ? 'is-leaving' : ''}`} aria-labelledby="cover-title">
      <Frame />
      <div className="cover__content is-shown">
        <p className="cover__eyebrow stagger" style={stagger(i++)}>
          {cover.eyebrow}
        </p>
        <p className="cover__title stagger" style={stagger(i++)}>
          {cover.title}
        </p>
        <Divider className="cover__divider stagger" />
        <h1 id="cover-title" className="cover__names stagger" style={stagger(i++)}>
          <span>{groom.firstName}</span>
          <span className="cover__amp">&amp;</span>
          <span>{bride.firstName}</span>
        </h1>
        <Divider className="cover__divider stagger" />
        <p className="cover__date stagger" style={stagger(i++)}>
          <span aria-hidden="true">
            {d.day} · {d.monthNumber} · {d.year}
          </span>
          <span className="sr-only">
            {d.weekday}, {d.day} {d.month} {d.year} at {formatTime(date.start)}
          </span>
        </p>
        <div className="stagger" style={stagger(i++)}>
          <button type="button" className="pill cover__open" onClick={onOpen} disabled={leaving}>
            {cover.openLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
