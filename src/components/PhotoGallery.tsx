import { useCallback, useEffect, useRef, useState } from 'react'
import { wedding, type GalleryImage } from '../config/wedding'
import { SectionHeading } from './SectionHeading'

function MissingImage() {
  return (
    <span className="gallery__missing">
      <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false">
        <path d="M8 32 C 14 20 24 12 34 8 C 30 18 22 28 8 32 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 32 L 26 16" stroke="currentColor" strokeWidth="1" />
      </svg>
      Photo unavailable
    </span>
  )
}

export function PhotoGallery() {
  const { enabled, images, intro } = wedding.gallery
  const [failed, setFailed] = useState<Set<number>>(() => new Set())
  const [index, setIndex] = useState<number | null>(null)

  if (!enabled || images.length === 0) return null

  const markFailed = (i: number) => setFailed((prev) => new Set(prev).add(i))

  // Return focus to the photo last viewed (Safari does not focus buttons on click, so we can't rely on activeElement).
  const closeLightbox = () => {
    const last = index
    setIndex(null)
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>(`[data-gallery-index="${last}"]`)?.focus({ preventScroll: false }),
    )
  }

  return (
    <section id="gallery" className="section section--gallery" aria-labelledby="gallery-title">
      <SectionHeading id="gallery-title" eyebrow="Cherished moments" title="Gallery" intro={intro} />
      <ul className="gallery">
        {images.map((img, i) => (
          <li key={img.src} className="gallery__item" style={{ aspectRatio: `${img.width} / ${img.height}` }} data-reveal>
            {failed.has(i) ? (
              <MissingImage />
            ) : (
              <button
                type="button"
                className="gallery__button"
                data-gallery-index={i}
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1} of ${images.length}: ${img.alt}`}
              >
                <img
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="(min-width: 1100px) 340px, (min-width: 640px) 33vw, 50vw"
                  width={img.width}
                  height={img.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  onError={() => markFailed(i)}
                />
              </button>
            )}
          </li>
        ))}
      </ul>
      {index !== null && <Lightbox images={images} index={index} onIndex={setIndex} onClose={closeLightbox} />}
    </section>
  )
}

interface LightboxProps {
  images: GalleryImage[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}

/** Native <dialog>: focus is trapped and Escape closes it. */
function Lightbox({ images, index, onIndex, onClose }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const swipeStart = useRef<number | null>(null)
  const justSwiped = useRef(false)
  const [broken, setBroken] = useState(false)
  const img = images[index]
  const count = images.length

  const go = useCallback(
    (delta: number) => {
      setBroken(false)
      onIndex((index + delta + count) % count)
    },
    [count, index, onIndex],
  )

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    document.documentElement.classList.add('is-locked')
    return () => document.documentElement.classList.remove('is-locked')
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label={`Image ${index + 1} of ${count}`}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault()
        onClose()
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(1)
        if (e.key === 'ArrowLeft') go(-1)
      }}
      onClick={(e) => {
        if (justSwiped.current) {
          justSwiped.current = false // the click that ends a swipe is not a backdrop tap
          return
        }
        if (e.target === e.currentTarget) onClose() // backdrop click
      }}
      onPointerDown={(e) => {
        swipeStart.current = e.clientX
      }}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return
        const dx = e.clientX - swipeStart.current
        swipeStart.current = null
        justSwiped.current = Math.abs(dx) > 50
        if (justSwiped.current) go(dx < 0 ? 1 : -1)
      }}
    >
      <figure className="lightbox__figure">
        {broken ? (
          <MissingImage />
        ) : (
          <img
            key={img.src}
            className="lightbox__image"
            src={img.src}
            srcSet={img.srcSet}
            sizes="100vw"
            width={img.width}
            height={img.height}
            alt={img.alt}
            onError={() => setBroken(true)}
            draggable={false}
          />
        )}
        <figcaption className="lightbox__caption">
          <span>{img.caption ?? img.alt}</span>
          <span className="lightbox__count">
            {index + 1} / {count}
          </span>
        </figcaption>
      </figure>
      <button type="button" className="lightbox__btn lightbox__close" onClick={onClose} aria-label="Close gallery">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {count > 1 && (
        <>
          <button type="button" className="lightbox__btn lightbox__prev" onClick={() => go(-1)} aria-label="Previous image">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M15 5 L8 12 L15 19" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <button type="button" className="lightbox__btn lightbox__next" onClick={() => go(1)} aria-label="Next image">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 5 L16 12 L9 19" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </>
      )}
    </dialog>
  )
}
