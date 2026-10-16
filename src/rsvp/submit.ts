/**
 * RSVP integration boundary.
 *
 * The form never claims a response was saved unless a real destination accepted it.
 * Modes are set in src/config/wedding.ts (rsvp.mode):
 *   preview  → nothing is sent; the guest is told so.
 *   endpoint → JSON is POSTed to VITE_RSVP_ENDPOINT (see README for a Google Sheets script).
 *   whatsapp → WhatsApp opens with a pre-written reply; the guest presses send.
 *   closed   → the form is replaced by a short note.
 */
import { wedding, type RsvpMode } from '../config/wedding'

export interface RsvpPayload {
  name: string
  attending: 'yes' | 'no'
  guests: number
  dietary: string
  message: string
  submittedAt: string
}

export type SubmitOutcome = 'saved' | 'preview' | 'whatsapp'

export class RsvpError extends Error {}

/** The mode actually in effect — an endpoint/whatsapp mode without its setting is treated as unavailable. */
export function effectiveMode(): RsvpMode | 'unconfigured' {
  const { mode, endpoint, whatsappNumber } = wedding.rsvp
  if (mode === 'endpoint' && !/^https:\/\//.test(endpoint)) return 'unconfigured'
  if (mode === 'whatsapp' && !/^\d{8,15}$/.test(whatsappNumber)) return 'unconfigured'
  return mode
}

function whatsappText(p: RsvpPayload) {
  const lines = [
    `Assalamu alaikum! RSVP for the wedding of ${wedding.groom.firstName} & ${wedding.bride.firstName}`,
    `Name: ${p.name}`,
    p.attending === 'yes' ? `Attending: Yes, ${p.guests} ${p.guests === 1 ? 'person' : 'people'}` : 'Attending: Sorry, unable to attend',
  ]
  if (p.dietary) lines.push(`Dietary: ${p.dietary}`)
  if (p.message) lines.push(`Message: ${p.message}`)
  return lines.join('\n')
}

export async function submitRsvp(payload: RsvpPayload): Promise<SubmitOutcome> {
  const mode = effectiveMode()

  if (mode === 'preview') {
    await new Promise((r) => setTimeout(r, 700))
    return 'preview'
  }

  if (mode === 'whatsapp') {
    const url = `https://wa.me/${wedding.rsvp.whatsappNumber}?text=${encodeURIComponent(whatsappText(payload))}`
    const win = window.open(url, '_blank', 'noopener')
    if (!win) window.location.href = url // popup blocked: navigate instead
    return 'whatsapp'
  }

  if (mode === 'endpoint') {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 15000)
    try {
      // text/plain keeps this a "simple" CORS request, which Google Apps Script web apps require.
      const res = await fetch(wedding.rsvp.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })
      if (!res.ok) throw new RsvpError(`RSVP endpoint responded with ${res.status}`)
      return 'saved'
    } catch (err) {
      throw err instanceof RsvpError ? err : new RsvpError(err instanceof Error ? err.message : 'Network error')
    } finally {
      window.clearTimeout(timeout)
    }
  }

  throw new RsvpError('RSVP is not available')
}
