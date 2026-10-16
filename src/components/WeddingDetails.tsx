import { useState } from 'react'
import { wedding, type Person } from '../config/wedding'
import { dateParts, downloadIcs, formatTimeRange, googleCalendarUrl, localEquivalent } from '../lib/date'
import { Blossom } from './Botanical'
import { SectionHeading } from './SectionHeading'

function Family({ role, person }: { role: string; person: Person }) {
  return (
    <div className="family" data-reveal>
      <p className="eyebrow">{role}</p>
      <p className="family__name">{person.fullName}</p>
      {person.parents && <p className="family__line">{person.parents}</p>}
      <p className="family__line">{person.lineage}</p>
    </div>
  )
}

export function WeddingDetails() {
  const { date, venue, details, groom, bride } = wedding
  const d = dateParts(date.start)
  // Computed once: the visitor's time zone does not change while the page is open.
  const [localTime] = useState(() => localEquivalent(date.start))

  return (
    <section id="details" className="section section--details" aria-labelledby="details-title">
      <SectionHeading id="details-title" eyebrow="Save the date" title="Wedding Details" />

      <div className="details-card" data-reveal>
        <dl className="details-grid">
          <div className="detail">
            <dt className="detail__label">Date</dt>
            <dd>
              <span className="detail__big">{d.weekday}</span>
              <span className="detail__sub">
                {d.day} {d.month} {d.year}
              </span>
            </dd>
          </div>
          <div className="detail">
            <dt className="detail__label">Time</dt>
            <dd>
              <span className="detail__big">{formatTimeRange(date.start, date.end)}</span>
              <span className="detail__sub">{date.timezoneLabel} · venue local time</span>
              {localTime && <span className="detail__note">That is {localTime} where you are.</span>}
            </dd>
          </div>
          <div className="detail">
            <dt className="detail__label">Venue</dt>
            <dd>
              <span className="detail__big">{venue.name}</span>
              <span className="detail__sub">{venue.address}</span>
            </dd>
          </div>
        </dl>

        {(details.dressCode || details.notes.length > 0) && (
          <div className="details-notes">
            {details.dressCode && (
              <p>
                <strong>Dress code:</strong> {details.dressCode}
              </p>
            )}
            {details.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        )}

        <div className="details-actions">
          <a className="btn btn--primary" href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">
            <PinIcon />
            Get Directions
            <span className="sr-only"> (opens Google Maps in a new tab)</span>
          </a>
          <div className="details-actions__row">
            <a className="btn btn--ghost" href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
              Google Calendar
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <button type="button" className="btn btn--ghost" onClick={downloadIcs}>
              Apple / Outlook
            </button>
          </div>
        </div>
      </div>

      <div className="families" aria-label="The families">
        <Family role="The Groom" person={groom} />
        <Blossom className="families__blossom" />
        <Family role="The Bride" person={bride} />
      </div>
    </section>
  )
}

function PinIcon() {
  return (
    <svg className="btn__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
