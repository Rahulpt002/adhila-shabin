import type { CSSProperties, Ref } from 'react'
import { wedding } from '../config/wedding'
import { formatLongDate, formatWeekday } from '../lib/date'
import { Blossom, Divider, GoldFern, SageSprig } from './Botanical'
import { Petals } from './Petals'

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

export function WelcomeHero({ titleRef, revealed }: { titleRef: Ref<HTMLHeadingElement>; revealed: boolean }) {
  const { groom, bride, date, venue, welcome } = wedding
  return (
    <section id="welcome" className={`hero ${revealed ? 'is-shown' : ''}`} aria-labelledby="hero-title">
      {revealed && <Petals count={7} className="petals--hero" />}

      <div className="hero__arch">
        <svg className="hero__arch-line" viewBox="0 0 300 420" preserveAspectRatio="none" aria-hidden="true">
          <path d="M6 420 V160 A144 144 0 0 1 294 160 V420" fill="none" stroke="var(--gold)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <path d="M16 420 V164 A134 134 0 0 1 284 164 V420" fill="none" stroke="var(--gold)" strokeWidth=".6" opacity=".6" vectorEffect="non-scaling-stroke" />
        </svg>
        <SageSprig className="hero__sprig hero__sprig--left" />
        <GoldFern className="hero__sprig hero__sprig--right" />
        <Blossom className="hero__blossom hero__blossom--a" />
        <Blossom className="hero__blossom hero__blossom--b" />

        <div className="hero__content">
          <p className="eyebrow stagger" style={stagger(0)}>
            {welcome.eyebrow}
          </p>
          <h1 id="hero-title" ref={titleRef} tabIndex={-1} className="hero__names">
            <span className="stagger" style={stagger(1)}>
              {groom.firstName}
            </span>
            <span className="hero__amp stagger" style={stagger(2)}>
              &amp;
            </span>
            <span className="stagger" style={stagger(3)}>
              {bride.firstName}
            </span>
          </h1>
          <p className="hero__date stagger" style={stagger(4)}>
            <time dateTime={date.start}>
              {formatWeekday(date.start)} · {formatLongDate(date.start)}
            </time>
          </p>
          <p className="hero__venue stagger" style={stagger(5)}>
            {venue.name}, {venue.locality}
          </p>
        </div>
      </div>

      <Divider className="hero__divider stagger" />
      <p className="hero__message stagger" style={stagger(6)}>
        {welcome.message}
      </p>

      <a href="#details" className="scroll-cue stagger" style={stagger(7)}>
        <span>Scroll to explore</span>
        <span className="scroll-cue__line" aria-hidden="true" />
      </a>
    </section>
  )
}
