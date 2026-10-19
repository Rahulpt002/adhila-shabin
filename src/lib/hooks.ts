import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Fades [data-reveal] elements in as they scroll into view.
 * Content is only hidden once this has run (html.reveal-ready), so nothing is lost if it never does.
 */
export function useScrollReveal(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return
    const root = document.documentElement
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )
    document.querySelectorAll('[data-reveal]:not(.is-visible)').forEach((el) => observer.observe(el))
    root.classList.add('reveal-ready')
    return () => observer.disconnect()
  }, [enabled])
}

/** One ticking clock for the countdown. */
export function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

const FADE_SECONDS = 1.2

/**
 * Looping background song.
 * Browsers only allow sound after a tap, so call `play()` from a click handler (the cover's button).
 * The song pauses while the tab is hidden and picks up again when the guest comes back.
 * `available` turns false if the file is missing or cannot be decoded, so the UI can hide its button.
 */
export function useBackgroundMusic(src: string, volume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const resumeOnShow = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [available, setAvailable] = useState(true)

  useEffect(() => {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = volume
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onError = () => {
      setAvailable(false)
      setPlaying(false)
    }
    audio.addEventListener('play', onPlay)
    audio.addEventListener('pause', onPause)
    audio.addEventListener('error', onError)
    audio.src = src
    audioRef.current = audio

    // Fade in at the start and out at the end of each loop, so the short clip repeats smoothly.
    // (iPhones ignore volume changes from the page; there it simply loops.)
    let frame = 0
    const fade = () => {
      const { currentTime, duration } = audio
      if (duration) {
        const edge = Math.min(currentTime, duration - currentTime)
        audio.volume = volume * Math.min(1, Math.max(0, edge / FADE_SECONDS))
      }
      frame = requestAnimationFrame(fade)
    }
    const startFade = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(fade)
    }
    const stopFade = () => cancelAnimationFrame(frame)
    audio.addEventListener('playing', startFade)
    audio.addEventListener('pause', stopFade)

    const onVisibility = () => {
      if (document.hidden) {
        resumeOnShow.current = !audio.paused
        audio.pause()
      } else if (resumeOnShow.current) {
        resumeOnShow.current = false
        audio.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      audio.removeEventListener('play', onPlay)
      audio.removeEventListener('pause', onPause)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('playing', startFade)
      audio.removeEventListener('pause', stopFade)
      stopFade()
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
      audioRef.current = null
    }
  }, [src, volume])

  const play = useCallback(() => {
    // A rejected promise just means the browser refused (e.g. file missing); the button stays usable.
    audioRef.current?.play().catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }, [])

  return { playing, available, play, toggle }
}
