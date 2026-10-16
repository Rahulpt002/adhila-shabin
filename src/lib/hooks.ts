import { useEffect, useSyncExternalStore } from 'react'

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

/** True when the visitor has asked their OS for reduced motion. */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  )
}

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

const OPENED_KEY = 'invitation-opened'

/** Remembers (for this browser tab session) that the envelope has been opened. */
export const openedMemory = {
  get(): boolean {
    try {
      return sessionStorage.getItem(OPENED_KEY) === '1'
    } catch {
      return false
    }
  },
  set() {
    try {
      sessionStorage.setItem(OPENED_KEY, '1')
    } catch {
      /* storage unavailable (private mode) — the guest simply sees the envelope again */
    }
  },
}
