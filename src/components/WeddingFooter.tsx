import { wedding } from '../config/wedding'
import { formatLongDate } from '../lib/date'
import { Divider, GoldFern, SageSprig } from './Botanical'

export function WeddingFooter({ onReplay }: { onReplay: () => void }) {
  const { closing, groom, bride, date } = wedding
  return (
    <footer className="footer" aria-labelledby="footer-title">
      <SageSprig className="footer__corner footer__corner--bl" />
      <GoldFern className="footer__corner footer__corner--br" />

      <div className="footer__inner" data-reveal>
        <p className="footer__message">{closing.message}</p>
        <h2 id="footer-title" className="footer__names">
          {groom.firstName} <span className="footer__amp">&amp;</span> {bride.firstName}
        </h2>
        <p className="footer__date">
          <time dateTime={date.start}>{formatLongDate(date.start)}</time>
        </p>
        <Divider className="footer__divider" />
        <p className="eyebrow">{closing.withLoveLabel}</p>
        <ul className="footer__family">
          {closing.withLove.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
        <div className="footer__actions">
          <button type="button" className="btn btn--ghost" onClick={onReplay}>
            Revisit the invitation
          </button>
          <a className="btn btn--text" href="#welcome">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  )
}
