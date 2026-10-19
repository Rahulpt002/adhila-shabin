import { wedding } from '../config/wedding'

const tz = wedding.date.timezone

/** "12:00 PM" */
export function formatTime(iso: string, timeZone = tz) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone })
    .format(new Date(iso))
    .replace(/[\u202f ]/g, '\u00a0')
}

/** Day, month and year parts — used for the large date tile and the cover. */
export function dateParts(iso: string, timeZone = tz) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
    timeZone,
  }).formatToParts(new Date(iso))
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  const monthNumber = new Intl.DateTimeFormat('en-GB', { month: '2-digit', timeZone }).format(new Date(iso))
  return { weekday: get('weekday'), day: get('day'), month: get('month'), monthNumber, year: get('year') }
}
