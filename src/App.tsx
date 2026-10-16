import { useCallback, useRef, useState } from 'react'
import { wedding } from './config/wedding'
import { openedMemory, useScrollReveal } from './lib/hooks'
import { CoupleStory } from './components/CoupleStory'
import { InvitationEnvelope } from './components/InvitationEnvelope'
import { PhotoGallery } from './components/PhotoGallery'
import { RSVPForm } from './components/RSVPForm'
import { SiteNav, type NavItem } from './components/SiteNav'
import { WeddingCountdown } from './components/WeddingCountdown'
import { WeddingDetails } from './components/WeddingDetails'
import { WeddingEvents } from './components/WeddingEvents'
import { WeddingFooter } from './components/WeddingFooter'
import { WelcomeHero } from './components/WelcomeHero'

const NAV_ITEMS: NavItem[] = [
  { id: 'welcome', label: 'Welcome' },
  ...(wedding.story ? [{ id: 'story', label: 'Our Story' }] : []),
  { id: 'details', label: 'Details' },
  { id: 'countdown', label: 'Countdown' },
  ...(wedding.events.length ? [{ id: 'events', label: 'Events' }] : []),
  ...(wedding.gallery.enabled && wedding.gallery.images.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
  { id: 'rsvp', label: 'RSVP' },
]

export default function App() {
  // Guests returning in the same tab session (reload, back navigation) go straight to the site.
  const [showEnvelope, setShowEnvelope] = useState(() => !openedMemory.get())
  const [replayKey, setReplayKey] = useState(0)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useScrollReveal(!showEnvelope)

  const handleOpened = useCallback(() => {
    openedMemory.set()
    setShowEnvelope(false)
    requestAnimationFrame(() => {
      // Honour a shared deep link such as …/#rsvp once the invitation has been opened.
      const target = window.location.hash && document.querySelector(window.location.hash)
      if (target && target.id !== 'welcome') target.scrollIntoView()
      else titleRef.current?.focus({ preventScroll: true })
    })
  }, [])

  const replay = useCallback(() => {
    window.scrollTo({ top: 0 })
    setReplayKey((k) => k + 1)
    setShowEnvelope(true)
  }, [])

  return (
    <>
      {showEnvelope && <InvitationEnvelope key={replayKey} onDone={handleOpened} />}

      <div className="site" inert={showEnvelope}>
        <a className="skip-link" href="#details">
          Skip to wedding details
        </a>
        <SiteNav items={NAV_ITEMS} />
        <main>
          <WelcomeHero titleRef={titleRef} revealed={!showEnvelope} />
          <CoupleStory />
          <WeddingDetails />
          <WeddingCountdown />
          <WeddingEvents />
          <PhotoGallery />
          <RSVPForm />
        </main>
        <WeddingFooter onReplay={replay} />
      </div>
    </>
  )
}
