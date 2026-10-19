import { wedding } from '../config/wedding'
import { useNow } from '../lib/hooks'
import { Frame } from './Frame'
import { PinIcon } from './Ornaments'

const START = new Date(wedding.date.start).getTime()
const END = new Date(wedding.date.end).getTime()

function split(ms: number) {
  const s = Math.floor(ms / 1000)
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }
}

const pad = (n: number) => String(n).padStart(2, '0')

function Countdown() {
  const now = useNow(1000)
  const { groom, bride, venue } = wedding

  if (now >= END) {
    return (
      <p className="countdown__message">
        Alhamdulillah — {groom.firstName} &amp; {bride.firstName} are married.
        <span>Thank you for your prayers, love and blessings.</span>
      </p>
    )
  }
  if (now >= START) {
    return (
      <p className="countdown__message">
        Today is the day!
        <span>
          The celebration is happening now at {venue.name}, {venue.locality}.
        </span>
      </p>
    )
  }

  const t = split(START - now)
  const units = [
    { label: 'Days', value: pad(t.days) },
    { label: 'Hours', value: pad(t.hours) },
    { label: 'Mins', value: pad(t.minutes) },
    { label: 'Secs', value: pad(t.seconds) },
  ]
  return (
    <>
      <p className="caps caps--gold countdown__title">Counting down to the big day</p>
      <div className="countdown__grid" aria-hidden="true">
        {units.map((u) => (
          <div className="countdown__unit" key={u.label}>
            <span className="countdown__value">{u.value}</span>
            <span className="caps countdown__label">{u.label}</span>
          </div>
        ))}
      </div>
      {/* One calm, minute-level sentence for screen readers instead of a value that changes every second. */}
      <p className="sr-only">
        {t.days} days, {t.hours} hours and {t.minutes} minutes until the wedding.
      </p>
    </>
  )
}

/** Page 3: venue and directions, the countdown, and the closing blessing. */
export function VenuePage() {
  const { venue, closing } = wedding

  return (
    <section id="venue" className="page" aria-labelledby="venue-title">
      <Frame petals={6} />
      <article className="card" data-reveal>
        <PinIcon className="venue__icon" />
        <h2 id="venue-title" className="venue__name">
          {venue.name}
        </h2>
        <p className="venue__address">{venue.address}</p>
        <a className="pill venue__maps" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
          <PinIcon className="pill__icon" />
          View on Google Maps
          <span className="sr-only"> (opens in a new tab)</span>
        </a>

        <div className="countdown" role="timer" aria-live="off">
          <Countdown />
        </div>

        <div className="closing">
          <p className="arabic arabic--small" lang="ar" dir="rtl">
            {closing.arabic}
          </p>
          <p className="caps caps--gold">{closing.translation}</p>
        </div>
      </article>
    </section>
  )
}
