import { wedding } from '../config/wedding'
import { formatLongDate, formatTimeRange, formatWeekday } from '../lib/date'
import { SectionHeading } from './SectionHeading'

/** Additional functions (Nikah, Mehendi, reception…). Renders nothing when the list is empty. */
export function WeddingEvents() {
  const events = wedding.events
  if (events.length === 0) return null

  return (
    <section id="events" className="section section--events" aria-labelledby="events-title">
      <SectionHeading id="events-title" eyebrow="Join us" title="Wedding Events" />
      <ul className="events">
        {events.map((e) => (
          <li className="event-card" key={e.id} data-reveal>
            {e.image && (
              <img
                className="event-card__image"
                src={e.image.src}
                srcSet={e.image.srcSet}
                sizes="(min-width: 768px) 360px, 90vw"
                width={e.image.width}
                height={e.image.height}
                alt={e.image.alt}
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="event-card__body">
              <h3 className="event-card__title">{e.title}</h3>
              <p className="event-card__when">
                <time dateTime={e.start}>
                  {formatWeekday(e.start)}, {formatLongDate(e.start)}
                </time>
                <span>{formatTimeRange(e.start, e.end)}</span>
              </p>
              <p className="event-card__venue">
                {e.venue}
                {e.address && <span>{e.address}</span>}
              </p>
              {e.description && <p className="event-card__text">{e.description}</p>}
              {e.mapsUrl && (
                <a className="btn btn--ghost btn--small" href={e.mapsUrl} target="_blank" rel="noopener noreferrer">
                  Directions<span className="sr-only"> to {e.title} (opens in a new tab)</span>
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
