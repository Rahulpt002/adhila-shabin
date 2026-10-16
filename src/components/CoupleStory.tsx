import { wedding } from '../config/wedding'
import { SectionHeading } from './SectionHeading'

/** Optional editorial timeline. Renders nothing when `story` is null in the config. */
export function CoupleStory() {
  const story = wedding.story
  if (!story || story.milestones.length === 0) return null

  return (
    <section id="story" className="section section--story" aria-labelledby="story-title">
      <SectionHeading id="story-title" eyebrow="How it began" title="Our Story" intro={story.intro} />
      <ol className="timeline">
        {story.milestones.map((m) => (
          <li className="timeline__item" key={m.title} data-reveal>
            <span className="timeline__dot" aria-hidden="true" />
            <p className="timeline__date">{m.date}</p>
            <h3 className="timeline__title">{m.title}</h3>
            <p className="timeline__text">{m.text}</p>
            {m.image && (
              <img
                className="timeline__image"
                src={m.image.src}
                srcSet={m.image.srcSet}
                sizes="(min-width: 768px) 420px, 90vw"
                width={m.image.width}
                height={m.image.height}
                alt={m.image.alt}
                loading="lazy"
                decoding="async"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}
