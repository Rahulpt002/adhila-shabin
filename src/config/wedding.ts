/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  WEDDING CONFIGURATION
 *  Every name, date, place, message and the song on the site comes from this file.
 *  Edit here — no other file needs to change for content updates.
 *  Never put secrets (API keys, passwords) here: this file ships to the browser.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export interface Person {
  /** Short name used on the cover, e.g. "Shabin". */
  firstName: string
  fullName: string
}

export const wedding = {
  site: {
    title: 'Shabin & Adhila · Wedding Invitation',
    description:
      'Shamsuddin & Shameena Shamsuddin invite you to the wedding of Mohammed Shabin Shamsuddin & Adhila Jamal — Sunday, 27 December 2026, Peruma Auditorium, Payyoli.',
  },

  blessing: {
    arabic: 'بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ',
    translation: 'In the name of Allah',
  },

  groom: {
    firstName: 'Shabin',
    fullName: 'Mohammed Shabin Shamsuddin',
  } as Person,

  bride: {
    firstName: 'Adhila',
    fullName: 'Adhila Jamal',
  } as Person,

  /** The main celebration. Times are ISO 8601 with the venue's UTC offset. */
  date: {
    start: '2026-12-27T12:00:00+05:30',
    end: '2026-12-27T15:00:00+05:30',
    /** IANA zone of the venue — used to display times exactly as printed on the card. */
    timezone: 'Asia/Kolkata',
  },

  venue: {
    name: 'Peruma Auditorium',
    locality: 'Payyoli',
    address: 'Payyoli, Kozhikode, Kerala',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Peruma+Auditorium+Payyoli',
  },

  cover: {
    eyebrow: 'Bismillah',
    title: 'The wedding of',
    openLabel: 'Open Invitation',
  },

  invitation: {
    lead: 'You are invited to the wedding of',
  },

  closing: {
    arabic: 'بَارَكَ ٱللَّٰهُ لَكُمَا',
    translation: 'May Allah bless you both',
  },

  /**
   * Background song. It starts when the guest taps "Open Invitation" and loops.
   * Put the audio file in /public/music (MP3 plays everywhere, including iPhone).
   * The music button hides itself if the file is missing.
   */
  music: {
    /** 1:55–2:10 of the song, cut to 15 seconds so it loads instantly. It loops with a short fade. */
    src: 'music/tose-naina.mp3',
    title: 'Tose Naina',
    volume: 0.6,
  },

  theme: {
    ivory: '#f4ece0',
    paper: '#fbf6ee',
    ink: '#3a2a24',
    muted: '#6e5a4e',
    burgundy: '#6b1d27',
    burgundyDeep: '#4a1018',
    rose: '#b0727a',
    gold: '#b8945a',
    goldDeep: '#8a6a35',
  },

  fonts: {
    script: "'Great Vibes', 'Snell Roundhand', cursive",
    display: "'Cinzel', 'Trajan Pro', 'Cormorant Garamond', serif",
    serif: "'Cormorant Garamond', 'Cormorant', Garamond, 'Times New Roman', serif",
    arabic: "'Amiri', 'Geeza Pro', 'Traditional Arabic', serif",
  },
}

export type Wedding = typeof wedding
