/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WEDDING CONFIGURATION
 *  Every name, date, place, message and image on the site comes from this file.
 *  Edit here — no other file needs to change for content updates.
 *  Never put secrets (API keys, passwords) here: this file ships to the browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Person {
  /** Short name used in headings, e.g. "Shabin". */
  firstName: string
  fullName: string
  /** Family line shown under the name on the invitation card. */
  lineage: string
  /** Optional parents line shown in "The Families". */
  parents?: string
}

export interface StoryMilestone {
  date: string
  title: string
  text: string
  image?: GalleryImage
}

export interface WeddingEvent {
  id: string
  title: string
  /** ISO 8601 with offset, e.g. "2026-12-26T19:00:00+05:30". */
  start: string
  end?: string
  venue: string
  address?: string
  description?: string
  mapsUrl?: string
  image?: GalleryImage
}

export interface GalleryImage {
  src: string
  /** Optional responsive sources, e.g. "/gallery/a-800.webp 800w, /gallery/a-1600.webp 1600w". */
  srcSet?: string
  /** Intrinsic size — prevents layout shift and picks the tile shape. */
  width: number
  height: number
  alt: string
  caption?: string
}

export type RsvpMode =
  /** Form works and validates, but nothing is sent. The guest is told so. */
  | 'preview'
  /** POSTs to VITE_RSVP_ENDPOINT (Google Apps Script, Formspree, your API…). */
  | 'endpoint'
  /** Opens WhatsApp with a pre-written reply to `whatsappNumber`. */
  | 'whatsapp'
  /** Shows a short "RSVPs are closed" note instead of the form. */
  | 'closed'

export const wedding = {
  site: {
    title: 'Shabin & Adhila · Wedding Invitation',
    description:
      'Shamsuddin & Shameena Shamsuddin invite you to the wedding of Mohammed Shabin Shamsuddin & Adhila Jamal — Sunday, 27 December 2026, Peruma Auditorium, Payyoli.',
  },

  blessing: {
    arabic: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
  },

  hosts: {
    intro: 'With great joy,',
    names: 'Shamsuddin & Shameena Shamsuddin',
    request: 'request the honour of your presence at the marriage of our beloved son',
  },

  groom: {
    firstName: 'Shabin',
    fullName: 'Mohammed Shabin Shamsuddin',
    parents: 'Son of Shamsuddin & Shameena Shamsuddin',
    lineage: 'Grandson of Late PK Mohammed & Ibrahim KTK',
  } as Person,

  bride: {
    firstName: 'Adhila',
    fullName: 'Adhila Jamal',
    lineage: 'Daughter of Jamal K.U. & Nadira Jamal',
  } as Person,

  /** Letters pressed into the wax seal. */
  monogram: { left: 'S', right: 'A' },

  /** The main celebration. Times are ISO 8601 with the venue's UTC offset. */
  date: {
    start: '2026-12-27T12:00:00+05:30',
    end: '2026-12-27T15:00:00+05:30',
    /** IANA zone of the venue — used to display times exactly as printed on the card. */
    timezone: 'Asia/Kolkata',
    timezoneLabel: 'IST',
  },

  venue: {
    name: 'Peruma Auditorium',
    locality: 'Payyoli',
    address: 'Payyoli, Kozhikode, Kerala',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Peruma+Auditorium+Payyoli',
  },

  envelope: {
    tagline: 'A Special Invitation Awaits You',
    openLabel: 'Open Your Invitation',
  },

  welcome: {
    eyebrow: 'The wedding of',
    message:
      'With hearts full of love and gratitude to Allah, we invite you to be part of the beginning of their forever. Your presence and your duas would mean the world to us.',
  },

  /** Extra lines shown in "Wedding Details". Leave empty to hide. */
  details: {
    dressCode: null as string | null,
    notes: [] as string[],
  },

  /** Set to null to hide "Our Story" entirely. */
  story: null as null | { intro: string; milestones: StoryMilestone[] },
  // Example:
  // story: {
  //   intro: 'Two families, one prayer, and a beautiful new beginning.',
  //   milestones: [
  //     { date: 'March 2026', title: 'The proposal', text: '…' },
  //     { date: 'June 2026', title: 'The engagement', text: '…' },
  //   ],
  // },

  /**
   * Additional functions (Nikah, Mehendi, reception…). The section is hidden when empty.
   * The main celebration above is always shown in "Wedding Details".
   */
  events: [] as WeddingEvent[],
  // Example:
  // events: [{
  //   id: 'nikah', title: 'Nikah', start: '2026-12-27T10:00:00+05:30',
  //   venue: 'Juma Masjid, Payyoli', mapsUrl: 'https://maps.google.com/?q=…',
  //   description: 'Family and close friends.',
  // }],

  gallery: {
    /** Set false to hide the gallery. */
    enabled: true,
    intro: 'Moments we hold dear — and many more still to come.',
    /**
     * PLACEHOLDER ARTWORK — replace with real photos before sharing widely.
     * Put files in /public/gallery and list them here (≈1600px long edge, WebP or JPEG).
     */
    images: [
      { src: 'gallery/placeholder-1.svg', width: 800, height: 1000, alt: 'Illustration: sage leaves framing a crescent moon' },
      { src: 'gallery/placeholder-2.svg', width: 1200, height: 800, alt: 'Illustration: golden fern beneath an arch' },
      { src: 'gallery/placeholder-3.svg', width: 800, height: 800, alt: 'Illustration: two interlocking rings' },
      { src: 'gallery/placeholder-4.svg', width: 800, height: 1000, alt: 'Illustration: dusty rose blossoms on a sage stem' },
      { src: 'gallery/placeholder-5.svg', width: 800, height: 800, alt: 'Illustration: a sage wreath with blush blossoms' },
      { src: 'gallery/placeholder-6.svg', width: 1200, height: 800, alt: 'Illustration: a lantern among olive branches' },
    ] as GalleryImage[],
  },

  rsvp: {
    mode: 'preview' as RsvpMode,
    /** Leave null if there is no deadline. ISO date, e.g. '2026-12-15'. */
    deadline: null as string | null,
    /** Max number of people per reply (including the guest). 1 hides the selector. */
    maxGuests: 6,
    askDietary: true,
    /** Used when mode = 'whatsapp'. International format, digits only, e.g. '919876543210'. */
    whatsappNumber: '',
    /** Used when mode = 'endpoint'. Set VITE_RSVP_ENDPOINT in .env.local — not here. */
    endpoint: (import.meta.env.VITE_RSVP_ENDPOINT as string | undefined) ?? '',
  },

  closing: {
    message:
      'Thank you for your prayers, your love and for being part of our story. We cannot wait to celebrate this beautiful beginning with you.',
    withLoveLabel: 'With love',
    withLove: ['Mohammed Shahin Shamsuddin', 'Shireen Fathima Shamsuddin', 'Nasarma & Manas Family'],
  },

  theme: {
    ivory: '#f7f2e9',
    paper: '#fcf9f3',
    cream: '#efe5d3',
    ink: '#3d342b',
    taupe: '#66543f',
    muted: '#6c5f51',
    sage: '#9cb8a9',
    sageDeep: '#4b6a5c',
    rose: '#dcb4aa',
    roseDeep: '#9c5e57',
    gold: '#bf9d62',
    goldDeep: '#7b5d2d',
    burgundy: '#6c2733',
  },

  fonts: {
    script: "'Great Vibes', 'Snell Roundhand', cursive",
    serif: "'Cormorant Garamond', 'Cormorant', Garamond, 'Times New Roman', serif",
    sans: "'Jost', 'Avenir Next', 'Segoe UI', system-ui, sans-serif",
    arabic: "'Amiri Bismillah', 'Amiri', 'Geeza Pro', 'Traditional Arabic', serif",
  },
}

export type Wedding = typeof wedding
