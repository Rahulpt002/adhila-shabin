import { Divider } from './Botanical'

interface Props {
  id: string
  eyebrow: string
  title: string
  intro?: string
}

export function SectionHeading({ id, eyebrow, title, intro }: Props) {
  return (
    <header className="section-heading" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="section-title">
        {title}
      </h2>
      <Divider className="section-heading__divider" />
      {intro && <p className="section-intro">{intro}</p>}
    </header>
  )
}
