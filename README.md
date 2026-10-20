# Shabin & Adhila: wedding invitation website

A three-page digital wedding invitation with background music:

1. **Cover**: Bismillah, "The wedding of", the couple's names, the date, and an **Open Invitation** button.
2. **Invitation**: the Arabic Bismillah, "You are invited to the wedding of", the couple, and date and time tiles.
3. **Venue**: the venue with a Google Maps button, a live countdown, the closing blessing بَارَكَ ٱللَّٰهُ لَكُمَا.

Built with **Vite, React 19 and TypeScript**. The peonies, gold scrollwork and embossed paper are all inline SVG and CSS, so there are no image downloads. Fonts are bundled into the build, so the site makes no Google Fonts requests.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build at http://localhost:4173
```

| Command | What it does |
| --- | --- |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Playwright end-to-end tests (mobile and desktop, Chromium and WebKit) |

The first time you run the tests, install the test browsers with `npx playwright install chromium webkit`.

## Background song

The site plays `public/music/Song.mp3` from 18.5 seconds to the end, cut into its own 26-second file:

```
public/music/wedding-song.mp3
```

- It starts when the guest taps **Open Invitation**, because browsers only allow sound after a tap. It then loops, fading in and out at each end so the repeat sounds smooth. On iPhone the fade is skipped because Safari doesn't let pages change the volume, so the clip simply loops.
- The round burgundy button at the bottom right plays and pauses it.
- The song pauses while the guest is in another app or tab, and resumes when they come back.
- If the file is missing, the music button hides itself and the rest of the site works as normal.

To use a different song or file name, change `music` in [`src/config/wedding.ts`](src/config/wedding.ts). Short clips load fastest on mobile data.

## Editing content

**Everything lives in [`src/config/wedding.ts`](src/config/wedding.ts).** That includes names, family lines, the date and time zone, the venue and Maps link, the messages, the song, theme colours and fonts. No other file needs to change for content updates.

- **Date and time** are ISO strings that carry the venue's UTC offset (`2026-12-27T12:00:00+05:30`). The cover date, the date and time tiles and the countdown all come from these.
- After the wedding starts, the countdown changes to "Today is the day!", and once it ends it shows a thank-you message.

## Deploying

The build in `dist/` is fully static and uses relative paths. It works on Vercel, Netlify, Cloudflare Pages, GitHub Pages (including sub-paths) or any static host.

For a link preview image on WhatsApp and other apps:

1. Set `VITE_SITE_URL=https://your-domain` in `.env.local`.
2. Run `npm run build`, then `npm run og-image`. This renders `public/og-image.jpg` (1200 × 630) from the cover.
3. Rebuild and deploy.

## Project structure

```
src/
  config/wedding.ts         ← all content, the song and theme settings
  App.tsx                   cover → pages flow, starts the music
  components/
    CoverPage.tsx           page 1
    InvitationPage.tsx      page 2
    VenuePage.tsx           page 3 (venue, countdown, blessing)
    MusicToggle.tsx         floating play/pause button
    Frame.tsx               ornate page frame
    Ornaments.tsx           SVG peonies, leaves, scrollwork, dividers, icons
    Petals.tsx              drifting petals
  lib/date.ts               time-zone-aware date and time formatting
  lib/hooks.ts              scroll reveal, ticking clock, background music
  styles/                   base and invitation CSS
public/music/               put the song here
tests/invitation.spec.ts    Playwright end-to-end tests
```

With **reduced motion** turned on, the cover fades out quickly, and the petals and the music button animation are turned off.
