/**
 * Renders public/og-image.jpg (1200×630), the preview shown when the link is shared
 * on WhatsApp, iMessage, Facebook and similar apps. Run after `npm run build`:
 *   npm run og-image
 */
import { chromium } from '@playwright/test'
import { preview } from 'vite'

const server = await preview({ preview: { port: 4174, strictPort: true }, logLevel: 'error' })
const browser = await chromium.launch()
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, reducedMotion: 'reduce' })
  await page.goto('http://localhost:4174/')
  await page.addStyleTag({ content: '.skip-btn, .petals { display: none !important; }' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 86 })
  console.log('Wrote public/og-image.jpg')
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
