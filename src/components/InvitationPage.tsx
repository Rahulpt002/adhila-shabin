import type { Ref } from 'react'
import { wedding } from '../config/wedding'
import { dateParts, formatTime } from '../lib/date'
import { Frame } from './Frame'
import { CalendarIcon, ClockIcon, Divider } from './Ornaments'

/** Page 2: blessing, the couple, and the date and time tiles. */
export function InvitationPage({ titleRef }: { titleRef: Ref<HTMLHeadingElement> }) {
  const { blessing, invitation, groom, bride, date } = wedding
  const d = dateParts(date.start)

  return (
    <section id="invitation" className="page" aria-labelledby="invitation-title">
      <Frame petals={6} />
      <article className="card" data-reveal>
        <h2 id="invitation-title" className="sr-only" ref={titleRef} tabIndex={-1}>
          Wedding invitation: {groom.fullName} and {bride.fullName}
        </h2>

        <p className="arabic" lang="ar" dir="rtl">
          {blessing.arabic}
        </p>
        <p className="caps caps--gold card__blessing">{blessing.translation}</p>

        <p className="italic card__lead">{invitation.lead}</p>

        <div className="couple">
          <p className="couple__name">{groom.fullName}</p>
          <p className="couple__amp" aria-hidden="true">
            &amp;
          </p>
          <p className="couple__name">{bride.fullName}</p>
        </div>

        <Divider className="card__divider" />

        <div className="tiles">
          <div className="tile">
            <CalendarIcon className="tile__icon" />
            <p className="caps tile__label">{d.month}</p>
            <p className="tile__day">{Number(d.day)}</p>
            <p className="caps tile__sub">{d.weekday}</p>
            <p className="tile__year">{d.year}</p>
          </div>
          <div className="tile">
            <ClockIcon className="tile__icon" />
            <p className="caps tile__label">Time</p>
            <p className="tile__time">
              <span>{formatTime(date.start)}</span> – <span>{formatTime(date.end)}</span>
            </p>
            <p className="caps tile__note">Celebration</p>
          </div>
        </div>
      </article>
    </section>
  )
}
