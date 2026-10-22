import { expect, test, type Page } from '@playwright/test'

const OPEN = { name: 'Open Invitation' }
const SONG = '**/music/*.mp3'

/** One second of silence as a WAV file, served in place of the real song so tests don't depend on it. */
function silentWav() {
  const rate = 8000
  const data = Buffer.alloc(rate)
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVEfmt ', 8)
  header.writeUInt32LE(16, 16)
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(rate, 24)
  header.writeUInt32LE(rate, 28)
  header.writeUInt16LE(1, 32)
  header.writeUInt16LE(8, 34)
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  data.fill(128)
  return Buffer.concat([header, data])
}

async function serveSong(page: Page) {
  await page.route(SONG, (route) => route.fulfill({ status: 200, contentType: 'audio/wav', body: silentWav() }))
}

function trackErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`))
  return errors
}

async function openInvitation(page: Page) {
  await page.getByRole('button', OPEN).click()
  await expect(page.locator('.cover')).toHaveCount(0)
}

test.beforeEach(async ({ page }) => {
  await serveSong(page)
})

test.describe('Cover', () => {
  test('shows the couple and opens to the invitation', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shabin')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Adhila')
    await expect(page.locator('.cover__date')).toContainText('27 · 12 · 2026')

    // The pages behind the cover are inert until it is opened.
    await expect(page.locator('main')).toHaveAttribute('inert', '')

    await openInvitation(page)
    await expect(page.locator('main')).not.toHaveAttribute('inert', '')
    await expect(page.locator('#invitation-title')).toBeFocused()
    expect(errors).toEqual([])
  })

  test('ignores repeated taps while opening', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', OPEN)
    await button.click()
    await expect(button).toBeDisabled()
    await expect(page.locator('.cover')).toHaveCount(0)
  })

  test('works with the keyboard alone', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', OPEN).focus()
    await page.keyboard.press('Enter')
    await expect(page.locator('.cover')).toHaveCount(0)
  })
})

test.describe('Invitation', () => {
  test('shows the blessing, couple, date and time', async ({ page }) => {
    await page.goto('/')
    await openInvitation(page)
    const card = page.locator('#invitation .card')
    await expect(card).toContainText('Together with love and Allah’s blessings,')
    await expect(card).toContainText('Invite you to celebrate the beginning of our beautiful journey.')
    await expect(card.getByText('Mohammed Shabin Shamsuddin', { exact: true })).toBeVisible()
    await expect(card.getByText('Adhila Jamal K U', { exact: true })).toBeVisible()
    await expect(card.locator('.tile__day')).toHaveText('27')
    await expect(card.locator('.tile').first()).toContainText(/december/i)
    await expect(card.locator('.tile').first()).toContainText(/sunday/i)
    await expect(card.locator('.tile__time')).toHaveText('12:00\u00a0PM – 3:00\u00a0PM')
  })

  test('venue links to Google Maps in a new tab', async ({ page }) => {
    await page.goto('/')
    await openInvitation(page)
    const maps = page.getByRole('link', { name: /View on Google Maps/ })
    await expect(maps).toHaveAttribute('href', /google\.com\/maps.*Peruma/)
    await expect(maps).toHaveAttribute('target', '_blank')
    await expect(page.locator('#venue')).toContainText('And We created you in pairs')
    await expect(page.locator('#venue')).toContainText('Your presence and duas would mean the world to us.')
  })
})

test.describe('Music', () => {
  test('starts when the invitation is opened and can be paused', async ({ page }) => {
    await page.goto('/')
    const toggle = page.locator('.music-toggle')
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await openInvitation(page)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
  })

  test('the button hides itself when the song file is missing', async ({ page }) => {
    await page.unroute(SONG)
    await page.route(SONG, (route) => route.fulfill({ status: 404, body: '' }))
    await page.goto('/')
    await openInvitation(page)
    await expect(page.locator('.music-toggle')).toHaveCount(0)
    await expect(page.locator('#invitation .card')).toBeVisible()
  })
})

test.describe('Countdown', () => {
  test('counts down before the wedding', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-12-26T11:58:30+05:30') })
    await page.goto('/')
    await openInvitation(page)
    const values = page.locator('.countdown__value')
    await expect(values.nth(0)).toHaveText('01')
    await expect(values.nth(1)).toHaveText('00')
    await expect(values.nth(2)).toHaveText('01')
  })

  test('shows a celebration message during the event', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-12-27T13:00:00+05:30') })
    await page.goto('/')
    await openInvitation(page)
    await expect(page.locator('.countdown')).toContainText('Today is the day!')
    await expect(page.locator('.countdown__grid')).toHaveCount(0)
  })

  test('never shows negative numbers after the event', async ({ page }) => {
    await page.clock.install({ time: new Date('2027-01-05T10:00:00+05:30') })
    await page.goto('/')
    await openInvitation(page)
    await expect(page.locator('.countdown')).toContainText('are married')
    await expect(page.locator('.countdown')).not.toContainText('-')
  })
})

test.describe('Responsive layout', () => {
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1440, 900],
  ]) {
    test(`no horizontal overflow at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      await expect(page.getByRole('button', OPEN)).toBeInViewport()
      await openInvitation(page)
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )
      expect(overflow).toBeLessThanOrEqual(0)
    })
  }

  test('interactive controls are at least 44px tall', async ({ page }) => {
    await page.goto('/')
    await openInvitation(page)
    for (const control of await page.locator('.pill, .music-toggle').all()) {
      const box = await control.boundingBox()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })
})
