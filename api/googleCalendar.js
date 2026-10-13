/**
 * Book a job on Google Calendar with the same service account used for the leads sheet.
 * The sheet is not a calendar. This module is what actually creates events.
 *
 * The calendar must be shared with the service account as "Make changes to events".
 * Set GOOGLE_CALENDAR_ID to that calendar's id.
 */
import { getAccessToken, loadServiceAccount } from './googleSheet.js'
import { formatDay, formatWhen, timeZone } from './schedule.js'

const SCOPE = 'https://www.googleapis.com/auth/calendar'

export function calendarConfigured() {
  return Boolean((process.env.GOOGLE_CALENDAR_ID || '').trim() && loadServiceAccount()?.email)
}

function calendarId() {
  return (process.env.GOOGLE_CALENDAR_ID || '').trim()
}

async function token() {
  const sa = loadServiceAccount()
  if (!sa?.email || !sa?.key) return null
  return getAccessToken(sa.email, sa.key, SCOPE)
}

export async function busyBetween(start, end) {
  const id = calendarId()
  const access = await token()
  if (!id || !access) return { ok: false, error: 'calendar_not_configured', busy: [] }
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      timeZone: timeZone(),
      items: [{ id }],
    }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[calendar] freeBusy', res.status, JSON.stringify(data).slice(0, 300))
    return { ok: false, error: 'calendar_error', busy: [], detail: data?.error?.message || '' }
  }
  const blocks = (data.calendars && data.calendars[id] && data.calendars[id].busy) || []
  return {
    ok: true,
    busy: blocks.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })),
  }
}

export async function findEventByCall(callId) {
  if (!callId || !calendarConfigured()) return null
  const id = calendarId()
  const access = await token()
  if (!access) return null
  const url = new URL(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events`,
  )
  url.searchParams.set('privateExtendedProperty', `voxCallId=${callId}`)
  url.searchParams.set('maxResults', '2')
  url.searchParams.set('singleEvents', 'true')
  const res = await fetch(url, { headers: { Authorization: `Bearer ${access}` } })
  if (!res.ok) return null
  const data = await res.json()
  return (data.items && data.items[0]) || null
}

export async function createJobEvent({ name, phone, address, issue, start, end, callId, business }) {
  const tz = timeZone()
  const id = calendarId()
  const access = await token()
  if (!id || !access) {
    return { ok: false, error: 'calendar_not_configured', when: formatWhen(start, tz) }
  }

  if (callId) {
    const existing = await findEventByCall(callId)
    if (existing?.start?.dateTime) {
      const whenDate = new Date(existing.start.dateTime)
      return {
        ok: true,
        duplicate: true,
        eventId: existing.id,
        htmlLink: existing.htmlLink || '',
        when: formatWhen(whenDate, tz),
        nextDate: formatDay(whenDate, tz),
      }
    }
  }

  const who = business || process.env.VOICE_BUSINESS_NAME || 'Service call'
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(id)}/events`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${access}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `${who}: ${issue || 'Service'} — ${name || 'Caller'}`,
        location: address || undefined,
        description: [
          name && `Name: ${name}`,
          phone && `Phone: ${phone}`,
          address && `Address: ${address}`,
          issue && `Issue: ${issue}`,
          callId && `Call: ${callId}`,
          'Booked by Vox Voice',
        ]
          .filter(Boolean)
          .join('\n'),
        start: { dateTime: start.toISOString(), timeZone: tz },
        end: { dateTime: end.toISOString(), timeZone: tz },
        extendedProperties: callId ? { private: { voxCallId: String(callId) } } : undefined,
      }),
    },
  )
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[calendar] insert', res.status, JSON.stringify(data).slice(0, 400))
    return {
      ok: false,
      error: 'calendar_error',
      detail: data?.error?.message || '',
      when: formatWhen(start, tz),
    }
  }
  return {
    ok: true,
    eventId: data.id,
    htmlLink: data.htmlLink || '',
    when: formatWhen(start, tz),
    nextDate: formatDay(start, tz),
  }
}
