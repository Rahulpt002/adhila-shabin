# Shabin & Adhila: wedding invitation website

A digital wedding invitation with an animated opening. The guest taps a sealed envelope, the wax seal cracks, the flap opens and the printed invitation slides out. The card then grows to fill the screen, and after that the guest can browse the wedding details.

Built with **Vite, React 19 and TypeScript**. Animation is plain CSS plus one Web Animations API call, with no animation library. Fonts are bundled into the build, so the site makes no Google Fonts requests.

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

## Editing content

**Everything lives in [`src/config/wedding.ts`](src/config/wedding.ts).** That includes names, family lines, the date and time zone, the venue and Maps link, all messages, the gallery, RSVP settings, theme colours and fonts. No other file needs to change for content updates.

- **Date and time** are ISO strings that carry the venue's UTC offset (`2026-12-27T12:00:00+05:30`). The countdown, calendar links and "that's 9:30 AM where you are" hint for guests abroad all come from these.
- **Our Story** is hidden while `story` is `null`. The file includes a commented example you can copy.
- **Extra events** (Nikah, reception and so on) go in `events`. The section only appears when the list has entries.
- **Dress code and guest notes** go in `details`. They are hidden when empty.

## Gallery photos

The six gallery images are **placeholder illustrations**. Replace them before sending the link:

1. Export each photo at about 1600 px on the long edge as WebP or JPEG (aim for under 300 KB each).
2. Put the files in `public/gallery/`.
3. List them in `gallery.images` with their real `width`, `height` and a descriptive `alt`. The size is used to reserve space while the photo loads, so the page doesn't jump.
4. Optional: add a smaller version with `srcSet`, for example `'gallery/a-800.webp 800w, gallery/a-1600.webp 1600w'`.

To hide the gallery entirely, set `gallery.enabled = false`.

## RSVP

The form validates input and shows clear loading, success and error states. **It never claims a reply was saved unless a real destination accepted it.** Set the mode with `rsvp.mode`:

| Mode | Behaviour |
| --- | --- |
| `preview` (default) | Nothing is sent. Guests see a "Preview mode" note, and the confirmation says their reply was **not** sent. |
| `endpoint` | Sends the reply as JSON to `VITE_RSVP_ENDPOINT` (set in `.env.local`, see `.env.example`). |
| `whatsapp` | Opens WhatsApp with the reply already written to `rsvp.whatsappNumber`. The guest presses send. |
| `closed` | Shows "RSVPs are now closed". |

If `endpoint` or `whatsapp` is selected but its setting is missing, the form is replaced by a polite note rather than failing silently.

### Collecting replies in Google Sheets (free, no server)

1. Create a Google Sheet and open **Extensions → Apps Script**.
2. Paste the script below, then choose **Deploy → New deployment → Web app**. Set "Execute as" to **Me** and "Who has access" to **Anyone**.
3. Copy the web-app URL into `.env.local` as `VITE_RSVP_ENDPOINT=…`. Set `rsvp.mode = 'endpoint'` and rebuild.

```js
function doPost(e) {
  const data = JSON.parse(e.postData.contents)
  SpreadsheetApp.getActiveSheet().appendRow([
    new Date(), data.name, data.attending, data.guests, data.dietary, data.message,
  ])
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

The form sends the body as `text/plain`, which lets Apps Script receive it without extra CORS setup. A hidden honeypot field filters out simple spam bots. **Never put API keys or passwords in this project.** Every `VITE_` variable is visible to anyone who opens the site.

## Deploying

The build in `dist/` is fully static and uses relative paths. It works on Netlify, Vercel, Cloudflare Pages, GitHub Pages (including sub-paths) or any static host.

For a link preview image on WhatsApp and other apps:

1. Set `VITE_SITE_URL=https://your-domain` in `.env.local`.
2. Run `npm run og-image`. This renders `public/og-image.jpg` (1200 × 630) from the invitation card.
3. Rebuild and deploy.

## How the opening works

`src/components/InvitationEnvelope.tsx` steps through these stages, which are set as `data-stage` on the scene:

`sealed → unsealing → flap → rising → expanding → card → leaving`

- The stages are driven by timers rather than `animationend` events, so a dropped event can never leave the sequence stuck.
- The flap turns in 3D. Its inner sage lining is a second face with `backface-visibility: hidden`.
- The full card grows out of the small card in the envelope using a FLIP animation (one `element.animate()` call).
- Double taps are ignored. "Skip animation" is always available until the card appears.
- With **reduced motion** turned on, opening goes straight to the card with a short fade, and the petals and float effects are off.
- The opened state is stored in `sessionStorage`, so reloading or pressing back doesn't replay the envelope. "Revisit the invitation" in the footer replays it on purpose.
- The rest of the site is rendered underneath but marked `inert` until the envelope closes. A `<noscript>` fallback in `index.html` still shows the key details if JavaScript fails.

## Project structure

```
src/
  config/wedding.ts         ← all content and theme settings
  components/
    InvitationEnvelope.tsx  envelope scene and opening sequence
    InvitationCard.tsx      full-screen invitation card
    Botanical.tsx           SVG sprigs, ferns, blossom, wax seal, dividers
    WelcomeHero, WeddingDetails, WeddingCountdown, CoupleStory,
    WeddingEvents, PhotoGallery (with lightbox), RSVPForm, WeddingFooter, SiteNav
  rsvp/submit.ts            RSVP integration boundary
  lib/date.ts               time-zone-aware formatting and calendar links
  lib/hooks.ts              reduced motion, scroll reveal, session memory
  styles/                   base, envelope and sections CSS
tests/invitation.spec.ts    Playwright end-to-end tests
```

### The Arabic font

The Bismillah line uses a cut-down copy of Amiri (`src/assets/fonts/amiri-bismillah.woff2`, about 20 KB instead of 108 KB). It contains only the glyphs of that one line. If you change `blessing.arabic`, regenerate the font:

```bash
python3 -m fontTools.subset node_modules/@fontsource/amiri/files/amiri-arabic-400-normal.woff2 \
  --text="<new Arabic text>" --layout-features='*' --flavor=woff2 \
  --output-file=src/assets/fonts/amiri-bismillah.woff2
```

Alternatively, replace the `@font-face` in `src/styles/base.css` with `import '@fontsource/amiri/arabic-400.css'` in `main.tsx`.
