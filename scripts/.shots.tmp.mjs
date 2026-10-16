import { chromium, webkit } from '@playwright/test'
const [out, eng = 'chromium', sizesArg = '390x844', mode = 'all'] = process.argv.slice(2)
const engine = eng === 'webkit' ? webkit : chromium
const browser = await engine.launch()
for (const s of sizesArg.split(',')) {
  const [w, h] = s.split('x').map(Number)
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: w < 800, isMobile: eng === 'chromium' && w < 800 })
  const errors = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('http://localhost:4173/')
  await page.waitForTimeout(600)
  await page.screenshot({ path: `${out}/${s}-${eng}-0-sealed.png` })
  await page.getByRole('button', { name: 'Open Your Invitation' }).click()
  for (const [stage, delay] of [['unsealing', 250], ['flap', 500], ['rising', 450], ['expanding', 300], ['card', 1700]]) {
    await page.waitForSelector(`[data-stage="${stage}"]`, { timeout: 5000 })
    await page.waitForTimeout(delay)
    await page.screenshot({ path: `${out}/${s}-${eng}-${stage}.png` })
  }
  if (mode === 'opening') { await page.close(); console.log(s, eng, 'errors:', JSON.stringify(errors)); continue }
  await page.getByRole('button', { name: 'Continue to Celebration' }).click()
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `${out}/${s}-${eng}-hero.png` })
  // Scroll through so every scroll-reveal fires, then capture the whole page.
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += Math.floor(h * 0.6)) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120) }
  await page.waitForTimeout(1000)
  await page.screenshot({ path: `${out}/${s}-${eng}-full.png`, fullPage: true })
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  console.log(s, eng, 'overflowX:', overflow, 'errors:', JSON.stringify(errors))
  await page.close()
}
await browser.close()
