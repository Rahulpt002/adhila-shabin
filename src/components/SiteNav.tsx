import { useEffect, useState } from 'react'
import { Monogram } from './Botanical'

export interface NavItem {
  id: string
  label: string
}

/** Fixed top bar. Inline links on wide screens; a disclosure menu on phones. */
export function SiteNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the section currently in the middle of the viewport.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [items])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className={`site-nav ${scrolled || open ? 'is-solid' : ''}`}>
      <nav className="site-nav__bar" aria-label="Sections">
        <a href="#welcome" className="site-nav__brand" onClick={() => setOpen(false)}>
          <Monogram />
          <span className="sr-only">Back to top</span>
        </a>
        <button
          type="button"
          className="site-nav__toggle"
          aria-expanded={open}
          aria-controls="site-nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="site-nav__toggle-icon" aria-hidden="true" />
          {open ? 'Close' : 'Menu'}
        </button>
        <ul id="site-nav-links" className={`site-nav__links ${open ? 'is-open' : ''}`}>
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? 'location' : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
