import { useCallback, useEffect, useRef, useState } from 'react'
import { wedding } from './config/wedding'
import { useBackgroundMusic, useScrollReveal } from './lib/hooks'
import { CoverPage } from './components/CoverPage'
import { InvitationPage } from './components/InvitationPage'
import { MusicToggle } from './components/MusicToggle'
import { VenuePage } from './components/VenuePage'

type Stage = 'cover' | 'leaving' | 'open'

const COVER_EXIT_MS = 1100
const COVER_EXIT_REDUCED_MS = 300

export default function App() {
  const [stage, setStage] = useState<Stage>('cover')
  const titleRef = useRef<HTMLHeadingElement>(null)
  const music = useBackgroundMusic(wedding.music.src, wedding.music.volume)

  useScrollReveal(stage !== 'cover')

  // The pages behind the cover don't scroll until it has been opened.
  useEffect(() => {
    document.documentElement.classList.toggle('is-locked', stage !== 'open')
  }, [stage])

  const open = useCallback(() => {
    if (stage !== 'cover') return
    // Must run inside the tap itself, or mobile browsers block the sound.
    music.play()
    setStage('leaving')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(
      () => {
        window.scrollTo({ top: 0 })
        setStage('open')
        requestAnimationFrame(() => titleRef.current?.focus({ preventScroll: true }))
      },
      reduced ? COVER_EXIT_REDUCED_MS : COVER_EXIT_MS,
    )
  }, [stage, music])

  return (
    <>
      {stage !== 'open' && <CoverPage leaving={stage === 'leaving'} onOpen={open} />}

      <main className="pages" inert={stage === 'cover'}>
        <InvitationPage titleRef={titleRef} />
        <VenuePage />
      </main>

      {music.available && <MusicToggle playing={music.playing} title={wedding.music.title} onToggle={music.toggle} />}
    </>
  )
}
