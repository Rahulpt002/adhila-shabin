import { wedding } from '../config/wedding'

const tz = wedding.date.timezone

/** "Sunday" */
export function formatWeekday(iso: string, timeZone = tz) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone }).format(new Date(iso))
}

/** "27 December 2026" */
export function formatLongDate(iso: string, timeZone = tz) {
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone }).format(
    new Date(iso),
  )
}

/** "12:00 PM" */
export function formatTime(iso: string, timeZone = tz) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone })
    .format(new Date(iso))
    .replace(/\u202f/g, ' ')
}

/** "12:00 PM – 3:00 PM" */
export function formatTimeRange(start: string, end?: string, timeZone = tz) {
  return end ? `${formatTime(start, timeZone)} – ${formatTime(end, timeZone)}` : formatTime(start, timeZone)
}

/** Day, month and year parts — used for the large date blocks. */
export function dateParts(iso: string, timeZone = tz) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    timeZone,
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return { weekday: get('weekday'), day: get('day'), month: get('month'), year: get('year') }
}

/**
 * If the visitor is in a different time zone from the venue, returns the start time
 * in their local zone (e.g. "10:30 AM, Sunday 27 December" for a guest in Bahrain).
 */
export function localEquivalent(iso: string): string | null {
  let visitorZone: string
  try {
    visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return null
  }
  if (!visitorZone || visitorZone === tz) return null
  const venueClock = `${formatLongDate(iso)} ${formatTime(iso)}`
  const localClock = `${formatLongDate(iso, visitorZone)} ${formatTime(iso, visitorZone)}`
  if (venueClock === localClock) return null
  const sameDay = formatLongDate(iso) === formatLongDate(iso, visitorZone)
  return sameDay
    ? formatTime(iso, visitorZone)
    : `${formatTime(iso, visitorZone)}, ${formatWeekday(iso, visitorZone)} ${formatLongDate(iso, visitorZone)}`
}

function toCalendarStamp(iso: string) {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

const eventTitle = `Wedding of ${wedding.groom.firstName} & ${wedding.bride.firstName}`
const eventLocation = `${wedding.venue.name}, ${wedding.venue.address}`
const eventDetails = `${wedding.groom.fullName} & ${wedding.bride.fullName}\n${wedding.venue.mapsUrl}`

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: eventTitle,
    dates: `${toCalendarStamp(wedding.date.start)}/${toCalendarStamp(wedding.date.end)}`,
    details: eventDetails,
    location: eventLocation,
    ctz: tz,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')
}

/** Downloads an .ics file — opens in Apple Calendar, Outlook and most Android calendars. */
export function downloadIcs() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Wedding Invitation//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${toCalendarStamp(wedding.date.start)}-${wedding.groom.firstName}-${wedding.bride.firstName}@wedding`.toLowerCase(),
    `DTSTAMP:${toCalendarStamp(new Date().toISOString())}`,
    `DTSTART:${toCalendarStamp(wedding.date.start)}`,
    `DTEND:${toCalendarStamp(wedding.date.end)}`,
    `SUMMARY:${escapeIcs(eventTitle)}`,
    `LOCATION:${escapeIcs(eventLocation)}`,
    `DESCRIPTION:${escapeIcs(eventDetails)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = `${wedding.groom.firstName}-${wedding.bride.firstName}-wedding.ics`.toLowerCase()
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
