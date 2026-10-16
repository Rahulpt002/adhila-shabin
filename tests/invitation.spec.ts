import { expect, test, type Page } from '@playwright/test'

const OPEN = { name: 'Open Your Invitation' }
const CONTINUE = { name: 'Continue to Celebration' }

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
  await page.getByRole('button', CONTINUE).click()
  await expect(page.locator('.envelope-scene')).toHaveCount(0)
}

async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
}

test.describe('Envelope opening', () => {
  test('opens the envelope, reveals the card, then the site', async ({ page }) => {
    const errors = trackErrors(page)
    await page.goto('/')
    const scene = page.locator('.envelope-scene')
    await expect(scene).toHaveAttribute('data-stage', 'sealed')
    await expect(page.getByText('A Special Invitation Awaits You')).toBeVisible()

    // The site behind the envelope is inert while it is shown.
    await expect(page.locator('.site')).toHaveAttribute('inert', '')

    await page.getByRole('button', OPEN).click()
    for (const stage of ['flap', 'rising', 'expanding', 'card']) {
      await expect(scene).toHaveAttribute('data-stage', stage, { timeout: 4000 })
    }

    const card = page.getByRole('article', { name: /Wedding invitation/ })
    await expect(card).toBeFocused()
    await expect(card.getByText('Mohammed Shabin Shamsuddin', { exact: true })).toBeVisible()
    await expect(card.getByText('Adhila Jamal', { exact: true })).toBeVisible()

    await page.getByRole('button', CONTINUE).click()
    await expect(scene).toHaveCount(0)
    await expect(page.locator('.site')).not.toHaveAttribute('inert', '')
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Shabin')

    expect(errors).toEqual([])
  })

  test('ignores repeated taps while opening', async ({ page }) => {
    await page.goto('/')
    const button = page.getByRole('button', OPEN)
    await button.click()
    await expect(button).toBeDisabled()
    await page.locator('.envelope').click({ force: true })
    await page.locator('.envelope').click({ force: true })
    await expect(page.locator('.envelope-scene')).toHaveAttribute('data-stage', 'card', { timeout: 5000 })
    await expect(page.locator('.inv-card')).toHaveCount(1)
  })

  test('tapping the envelope itself opens it', async ({ page }) => {
    await page.goto('/')
    await page.locator('.envelope').click({ force: true }) // it gently floats, so it is never 'stable'
    await expect(page.locator('.envelope-scene')).not.toHaveAttribute('data-stage', 'sealed')
  })

  test('skip animation goes straight to the site', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await expect(page.locator('.envelope-scene')).toHaveCount(0)
    await expect(page.locator('#welcome')).toBeVisible()
  })

  test('works with the keyboard alone', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit only tabs to links/buttons with the macOS "tab to all controls" setting')
    await page.goto('/')
    const open = page.getByRole('button', OPEN)
    for (let i = 0; i < 5 && !(await open.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab')
    await expect(open).toBeFocused()
    await page.keyboard.press('Enter')
    const card = page.getByRole('article', { name: /Wedding invitation/ })
    await expect(card).toBeFocused({ timeout: 5000 })
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', CONTINUE)).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('.envelope-scene')).toHaveCount(0)
  })

  test('does not replay after reload or back navigation in the same session', async ({ page }) => {
    await page.goto('/')
    await openInvitation(page)
    await page.locator('a[href="#rsvp"]').first().evaluate((a: HTMLAnchorElement) => a.click())
    await expect(page).toHaveURL(/#rsvp$/)
    await page.goBack()
    await expect(page.locator('.envelope-scene')).toHaveCount(0)
    await page.reload()
    await expect(page.locator('.envelope-scene')).toHaveCount(0)
    await expect(page.locator('#welcome')).toBeVisible()
  })

  test('"Revisit the invitation" replays the envelope', async ({ page }) => {
    await page.goto('/')
    await openInvitation(page)
    await page.getByRole('button', { name: 'Revisit the invitation' }).click()
    await expect(page.locator('.envelope-scene')).toHaveAttribute('data-stage', 'sealed')
    await openInvitation(page)
  })

  test('reduced motion opens straight to the card', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('.petals').first()).toBeHidden()
    await page.getByRole('button', OPEN).click()
    await expect(page.locator('.envelope-scene')).toHaveAttribute('data-stage', 'card')
    await expect(page.getByRole('button', CONTINUE)).toBeVisible({ timeout: 1000 })
    await page.getByRole('button', CONTINUE).click()
    await expect(page.locator('.envelope-scene')).toHaveCount(0, { timeout: 1000 })
    await context.close()
  })
})

test.describe('Responsive layout', () => {
  const PHONES = [
    [320, 568],
    [360, 640],
    [375, 667],
    [390, 844],
    [390, 664], // iPhone 14 in Safari with toolbars showing
    [360, 680], // typical Android Chrome with address bar
    [430, 932],
    [430, 740], // large iPhone in Safari with toolbars
    [844, 390], // landscape phone
  ] as const
  const WIDER = [768, 1024, 1280, 1440]

  for (const [width, height] of PHONES) {
    test(`envelope + card fit at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height })
      await page.goto('/')
      expect(await horizontalOverflow(page)).toBe(0)
      const env = await page.locator('.envelope-wrap').boundingBox()
      expect(env!.y).toBeGreaterThanOrEqual(0)
      expect(env!.y + env!.height).toBeLessThanOrEqual(height)
      await expect(page.getByRole('button', OPEN)).toBeInViewport({ ratio: 1 })

      await page.getByRole('button', OPEN).click()
      await expect(page.locator('.envelope-scene')).toHaveAttribute('data-stage', 'card', { timeout: 5000 })
      await page.waitForTimeout(1600) // let the staggered text settle
      const card = await page.locator('.inv-card').boundingBox()
      expect(card!.y).toBeGreaterThanOrEqual(0)
      expect(card!.x).toBeGreaterThanOrEqual(0)
      expect(card!.y + card!.height).toBeLessThanOrEqual(height + 0.5)
      expect(card!.x + card!.width).toBeLessThanOrEqual(width + 0.5)
      // Portrait phones: the whole card is readable without scrolling inside it.
      if (height > width) {
        const scrollable = await page.locator('.inv-card__inner').evaluate((el) => el.scrollHeight - el.clientHeight)
        expect(scrollable).toBeLessThanOrEqual(1)
        await expect(page.getByRole('button', CONTINUE)).toBeInViewport({ ratio: 1 })
      }
      expect(await horizontalOverflow(page)).toBe(0)
    })
  }

  for (const width of [320, 360, 375, 390, 430, ...WIDER]) {
    test(`site has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      await page.getByRole('button', { name: 'Skip animation' }).click()
      await expect(page.locator('.envelope-scene')).toHaveCount(0)
      // Walk down the page so every reveal has run before measuring.
      const total = await page.evaluate(() => document.documentElement.scrollHeight)
      for (let y = 0; y < total; y += 500) await page.evaluate((top) => window.scrollTo(0, top), y)
      expect(await horizontalOverflow(page)).toBe(0)

      const offenders = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth
        return [...document.querySelectorAll('main *, footer *')]
          .filter((el) => !el.closest('svg') && !el.closest('[aria-hidden="true"]') && !el.closest('.sr-only'))
          .filter((el) => {
            const r = el.getBoundingClientRect()
            return r.width > 0 && (r.right > vw + 1 || r.left < -1)
          })
          .map((el) => `${el.tagName.toLowerCase()}.${el.className}`)
      })
      expect(offenders).toEqual([])
    })
  }

  test('interactive controls are at least 44px tall', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.site button, .site a, .site input, .site select, .site textarea')]
        .filter((el) => el.offsetParent !== null && !el.classList.contains('skip-link') && !el.closest('.field--honeypot'))
        .filter((el) => !(el instanceof HTMLInputElement && el.type === 'radio')) // the whole .choice row is the target
        .map((el) => ({ el: el.outerHTML.slice(0, 80), h: el.getBoundingClientRect().height }))
        .filter(({ h }) => h < 44),
    )
    expect(small).toEqual([])
  })
})

test.describe('Countdown', () => {
  test('counts down before the wedding', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-12-26T11:59:00+05:30') })
    await page.goto('/#countdown')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    const grid = page.locator('.countdown__grid')
    await expect(grid.locator('.countdown__value').first()).toHaveText('1')
    await expect(grid.locator('.countdown__label').first()).toHaveText('Day')
    await expect(grid.locator('.countdown__value').nth(1)).toHaveText('00')
  })

  test('shows a celebration message during the event', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-12-27T13:00:00+05:30') })
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await expect(page.locator('.countdown')).toContainText('Today is the day!')
    await expect(page.locator('.countdown__grid')).toHaveCount(0)
  })

  test('never shows negative numbers after the event', async ({ page }) => {
    await page.clock.install({ time: new Date('2027-01-05T10:00:00+05:30') })
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await expect(page.locator('.countdown')).toContainText('are married')
    await expect(page.locator('.countdown')).not.toContainText('-')
  })

  test('shows local time for guests in another time zone', async ({ browser }) => {
    const context = await browser.newContext({ timezoneId: 'Asia/Bahrain' })
    const page = await context.newPage()
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await expect(page.locator('.detail__note')).toHaveText('That is 9:30 AM where you are.')
    await context.close()
  })
})

test.describe('Details', () => {
  test('directions and calendar links are correct', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    const directions = page.getByRole('link', { name: /Get Directions/ })
    await expect(directions).toHaveAttribute('href', /google\.com\/maps\/search\/.*Peruma\+Auditorium\+Payyoli/)
    await expect(directions).toHaveAttribute('target', '_blank')
    const gcal = page.getByRole('link', { name: /Google Calendar/ })
    await expect(gcal).toHaveAttribute('href', /dates=20261227T063000Z%2F20261227T093000Z/)
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Apple / Outlook' }).click()
    expect((await download).suggestedFilename()).toBe('shabin-adhila-wedding.ics')
  })
})

test.describe('RSVP', () => {
  test('validates, then confirms honestly in preview mode', async ({ page }) => {
    await page.goto('/#rsvp')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await page.getByRole('button', { name: 'Send RSVP' }).click()

    const name = page.getByLabel('Your name')
    await expect(name).toBeFocused()
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Please enter your name.')).toBeVisible()
    await expect(page.getByText('Please let us know whether you can attend.')).toBeVisible()

    await name.fill('Fathima Rahman')
    await expect(page.getByText('Please enter your name.')).toHaveCount(0)
    await page.getByText('Joyfully accepts').click()
    await page.getByLabel('Number of guests').selectOption('3')
    await page.getByLabel(/Dietary requirements/).fill('Vegetarian')
    await page.getByLabel(/message for the couple/).fill('Mabrook!')
    await page.getByRole('button', { name: 'Send RSVP' }).click()

    await expect(page.getByRole('button', { name: /Sending/ })).toBeDisabled()
    const result = page.getByRole('status').filter({ hasText: 'Fathima' })
    await expect(result).toBeVisible()
    await expect(result).toContainText('not sent')
    await expect(result).toBeFocused()
  })

  test('declining hides the guest and dietary fields', async ({ page }) => {
    await page.goto('/#rsvp')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await page.getByText('Regretfully declines').click()
    await expect(page.getByLabel('Number of guests')).toHaveCount(0)
    await expect(page.getByLabel(/Dietary requirements/)).toHaveCount(0)
  })
})

test.describe('Gallery', () => {
  test('lightbox opens, navigates and closes with the keyboard', async ({ page }) => {
    await page.goto('/#gallery')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    const first = page.getByRole('button', { name: /View image 1 of 6/ })
    await first.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('.lightbox__count')).toHaveText('1 / 6')
    await page.keyboard.press('ArrowRight')
    await expect(dialog.locator('.lightbox__count')).toHaveText('2 / 6')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(dialog.locator('.lightbox__count')).toHaveText('6 / 6')
    await page.getByRole('button', { name: 'Next image' }).click()
    await expect(dialog.locator('.lightbox__count')).toHaveText('1 / 6')
    await page.keyboard.press('Escape')
    await expect(dialog).toHaveCount(0)
    await expect(first).toBeFocused()
  })

  test('a missing photo shows a graceful placeholder', async ({ page }) => {
    await page.route('**/gallery/placeholder-3.svg', (route) => route.fulfill({ status: 404 }))
    await page.goto('/#gallery')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    await page.locator('#gallery').scrollIntoViewIfNeeded()
    await expect(page.getByText('Photo unavailable')).toBeVisible()
    await expect(page.getByRole('button', { name: /View image/ })).toHaveCount(5)
  })
})

test.describe('Navigation', () => {
  test('menu links reach each section', async ({ page, isMobile }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip animation' }).click()
    if (isMobile) {
      const toggle = page.getByRole('button', { name: 'Menu' })
      await toggle.click()
      await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute('aria-expanded', 'true')
    }
    await page.getByRole('navigation').getByRole('link', { name: 'RSVP' }).click()
    await expect(page).toHaveURL(/#rsvp$/)
    await expect(page.locator('#rsvp-title')).toBeInViewport()
    if (isMobile) await expect(page.locator('#site-nav-links')).toBeHidden()
  })
})
