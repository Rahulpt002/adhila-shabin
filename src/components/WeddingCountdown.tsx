import { useEffect, useState } from 'react'
import { wedding } from '../config/wedding'
import { SectionHeading } from './SectionHeading'

const START = new Date(wedding.date.start).getTime()
const END = new Date(wedding.date.end).getTime()

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

function split(ms: number) {
  const s = Math.floor(ms / 1000)
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 }
}

const pad = (n: number) => String(n).padStart(2, '0')

export function WeddingCountdown() {
  const now = useNow(1000)
  const { groom, bride, venue } = wedding

  let body
  if (now >= END) {
    body = (
      <p className="countdown__message">
        Alhamdulillah — {groom.firstName} &amp; {bride.firstName} are married.
        <span>Thank you for your prayers, love and blessings.</span>
      </p>
    )
  } else if (now >= START) {
    body = (
      <p className="countdown__message">
        Today is the day!
        <span>
          The celebration is happening now at {venue.name}, {venue.locality}.
        </span>
      </p>
    )
  } else {
    const t = split(START - now)
    const units = [
      { label: t.days === 1 ? 'Day' : 'Days', value: String(t.days) },
      { label: t.hours === 1 ? 'Hour' : 'Hours', value: pad(t.hours) },
      { label: 'Minutes', value: pad(t.minutes) },
      { label: 'Seconds', value: pad(t.seconds) },
    ]
    body = (
      <>
        <div className="countdown__grid" aria-hidden="true">
          {units.map((u) => (
            <div className="countdown__unit" key={u.label}>
              <span className="countdown__value" key={u.value}>
                {u.value}
              </span>
              <span className="countdown__label">{u.label}</span>
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

  return (
    <section id="countdown" className="section section--countdown" aria-labelledby="countdown-title">
      <SectionHeading id="countdown-title" eyebrow="Counting the moments" title="Until We Celebrate" />
      <div className="countdown" data-reveal role="timer" aria-live="off">
        {body}
      </div>
    </section>
  )
}
