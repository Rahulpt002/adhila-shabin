import { Bouquet, CornerScroll, Flourish } from './Ornaments'
import { Petals } from './Petals'

/** The ornate ivory page: gold border, scrollwork, peony corners and drifting petals. */
export function Frame({ petals = 8 }: { petals?: number }) {
  return (
    <div className="frame" aria-hidden="true">
      <Flourish className="frame__flourish frame__flourish--top" />
      <Flourish className="frame__flourish frame__flourish--bottom" />
      <CornerScroll className="frame__scroll frame__scroll--tr" />
      <CornerScroll className="frame__scroll frame__scroll--bl" />
      <Bouquet className="frame__bouquet frame__bouquet--tl" />
      <Bouquet className="frame__bouquet frame__bouquet--br" />
      {petals > 0 && <Petals count={petals} />}
    </div>
  )
}
