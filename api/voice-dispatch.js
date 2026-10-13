/**
 * POST /api/voice-dispatch
 * Vapi tools: flagEmergency, bookJob.
 *
 * flagEmergency texts the owner immediately and logs Status=Emergency.
 * bookJob checks shop hours + Google Calendar free/busy, then creates an event.
 * Without GOOGLE_CALENDAR_ID the request is saved on the leads sheet only.
 */
import { sheetAlreadyHas, writeLeadToSheet } from './googleSheet.js'
import { busyBetween, calendarConfigured, createJobEvent } from './googleCalendar.js'
import { normalizePhone, sendTwilioSms, twilioConfigured } from './reviewsShared.js'
import {
  formatWhen,
  isOpenAt,
  jobMinutes,
  looksLikeEmergency,
  overlaps,
  parseRequestedStart,
  suggestSlots,
  timeZone,
} from './schedule.js'

const recent = globalThis.__voxDispatchRecent || new Map()
globalThis.__voxDispatchRecent = recent

function clean(s, max = 200) {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

function businessName() {
  return clean(process.env.VOICE_BUSINESS_NAME || 'the shop', 80)
}

function ownerPhone() {
  return normalizePhone(process.env.VOICE_OWNER_PHONE || process.env.REVIEW_OWNER_PHONE || '')
}

function recall(key) {
  if (!key) return null
  const hit = recent.get(key)
  if (!hit) return null
  if (Date.now() - hit.at > 6 * 60 * 60 * 1000) return null
  return hit.value
}

function remember(key, value) {
  if (!key) return
  recent.set(key, { at: Date.now(), value })
  if (recent.size > 200) {
    const first = recent.keys().next().value
    recent.delete(first)
  }
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function unwrap(body) {
  if (!body || typeof body !== 'object') return body
  return body.message && typeof body.message === 'object' ? body.message : body
}

function extractToolArgs(message) {
  const list =
    message?.toolCallList ||
    message?.toolWithToolCallList?.map((t) => t.toolCall).filter(Boolean) ||
    message?.toolCalls ||
    []
  const first = Array.isArray(list) ? list[0] : null
  if (!first) return { toolCallId: '', name: '', args: {} }
  const toolCallId = first.id || first.toolCallId || ''
  const name = first.function?.name || first.name || ''
  let args = first.function?.arguments ?? first.arguments ?? first.parameters ?? {}
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args)
    } catch {
      args = {}
    }
  }
  return { toolCallId, name, args: args && typeof args === 'object' ? args : {} }
}

async function smsOwner(body) {
  const owner = ownerPhone()
  if (!owner || !twilioConfigured()) return { ok: false, error: 'sms_not_configured' }
  return sendTwilioSms(owner, body, { kind: 'owner_alert' })
}

async function emailOwner(payload) {
  const formspree =
    process.env.FORMSPREE_ENDPOINT ||
    process.env.VITE_FORMSPREE_ENDPOINT ||
    'https://formspree.io/f/xzezgyen'
  try {
    const r = await fetch(formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    return r.ok
  } catch (e) {
    console.error('[voice-dispatch] email', e)
    return false
  }
}

function leadBase({ name, phone, address, issue, callId }) {
  return {
    name: clean(name, 120) || 'Caller',
    phone: normalizePhone(phone) || clean(phone, 40),
    email: '',
    business: businessName(),
    city: '',
    trade: clean(process.env.VOICE_TRADE || 'service', 40),
    notes: [clean(issue, 300), address ? `address=${clean(address, 160)}` : '', callId ? `call=${callId}` : '']
      .filter(Boolean)
      .join(' | '),
    source: 'live-voice',
    site: 'vox.chat',
    timestamp: new Date().toISOString(),
  }
}

export async function flagEmergency(args, callId) {
  const name = clean(args.name || args.customerName || '', 80)
  const phone = normalizePhone(args.phone || args.callback || args.phoneNumber || '') || clean(args.phone || '', 40)
  const address = clean(args.address || args.location || '', 160)
  const issue = clean(args.issue || args.reason || args.notes || 'Emergency', 300)
  const key = callId ? `${callId}:emergency` : ''
  const cached = recall(key)
  if (cached) return cached
  if (callId && (await sheetAlreadyHas(`call=${callId}`))) {
    const dup = {
      ok: true,
      emergency: true,
      duplicate: true,
      marker: 'VOX_EMERGENCY_SENT',
      say: `Already alerted. Tell them ${businessName()} was notified and will reach out as fast as possible. Do not promise an arrival time.`,
    }
    remember(key, dup)
    return dup
  }
  if (!phone) {
    return {
      ok: false,
      error: 'needs_phone',
      say: 'Ask for a callback number, then call flagEmergency again.',
    }
  }

  const smsBody = `EMERGENCY ${businessName()}: ${name || 'Caller'} ${phone}${address ? ` ${address}` : ''} — ${issue}. Call them now.`
  const sms = await smsOwner(smsBody)
  const row = leadBase({ name, phone, address, issue, callId })
  row.status = 'Emergency'
  row.interest = 'emergency'
  row.nextStep = 'Dispatch now'
  await writeLeadToSheet(row)
  await emailOwner({
    ...row,
    _subject: `EMERGENCY ${businessName()}: ${name || phone}`,
    _replyto: 'email@vox.chat',
    _format: 'plain',
  })

  const result = {
    ok: true,
    emergency: true,
    sms: sms.ok ? 'sent' : sms.error || 'failed',
    marker: 'VOX_EMERGENCY_SENT',
    say: `${businessName()} was just alerted. Tell the caller someone will reach out as fast as possible. Do not invent an arrival time. Do not book a normal appointment.`,
  }
  remember(key, result)
  console.log('[voice-dispatch] emergency', { name: name || null, sms: result.sms, callId: callId || null })
  return result
}

export async function bookJob(args, callId) {
  const name = clean(args.name || args.customerName || '', 80)
  const phone = normalizePhone(args.phone || args.callback || args.phoneNumber || '') || clean(args.phone || '', 40)
  const address = clean(args.address || args.location || '', 160)
  const issue = clean(args.issue || args.service || args.notes || 'Service call', 300)
  const tz = timeZone()
  const duration = jobMinutes()

  if (looksLikeEmergency({ emergency: args.emergency, issue, transcript: '' })) {
    return flagEmergency(args, callId)
  }

  const key = callId ? `${callId}:book` : ''
  const cached = recall(key)
  if (cached?.booked) return cached

  if (!phone) {
    return { ok: false, error: 'needs_phone', say: 'Ask for a callback number, then call bookJob again.' }
  }
  if (!address) {
    return { ok: false, error: 'needs_address', say: 'Ask for the service address, then call bookJob again.' }
  }

  const parsed = parseRequestedStart(args.start || args.when || args.time || '', new Date(), tz)
  if (!parsed.ok) {
    return { ok: false, error: parsed.error, say: parsed.message }
  }

  const start = parsed.start
  const end = new Date(start.getTime() + duration * 60000)
  const when = formatWhen(start, tz)

  if (!isOpenAt(start, duration, tz)) {
    const slots = suggestSlots({ now: new Date(), tz, durationMin: duration, busy: [], count: 3 })
    return {
      ok: false,
      error: 'outside_hours',
      suggestions: slots.map((s) => formatWhen(s, tz)),
      say: `${when} is outside shop hours. Offer only these times: ${slots.map((s) => formatWhen(s, tz)).join('; ') || 'the next open weekday morning'}.`,
    }
  }

  let busy = []
  if (calendarConfigured()) {
    const windowEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    const fb = await busyBetween(new Date(), windowEnd)
    if (fb.ok) busy = fb.busy
  }

  if (overlaps(start, end, busy)) {
    const slots = suggestSlots({ now: new Date(), tz, durationMin: duration, busy, count: 3 })
    return {
      ok: false,
      error: 'taken',
      suggestions: slots.map((s) => formatWhen(s, tz)),
      say: `${when} is already booked. Offer only these open times: ${slots.map((s) => formatWhen(s, tz)).join('; ') || 'ask them for another day'}.`,
    }
  }

  const event = await createJobEvent({
    name,
    phone,
    address,
    issue,
    start,
    end,
    callId,
    business: businessName(),
  })

  if (event.duplicate) {
    const dup = {
      ok: true,
      booked: true,
      calendar: true,
      duplicate: true,
      when: event.when,
      marker: 'VOX_BOOKED',
      say: `Already booked. Confirm they are on the schedule for ${event.when}.`,
    }
    remember(key, dup)
    return dup
  }

  const onCalendar = Boolean(event.ok)
  const row = leadBase({ name, phone, address, issue, callId })
  row.status = onCalendar ? 'Booked' : 'Requested'
  row.interest = 'job'
  row.nextStep = onCalendar ? 'On calendar' : 'Confirm time'
  row.nextDate = event.nextDate || when
  if (!(callId && (await sheetAlreadyHas(`call=${callId}`)))) {
    await writeLeadToSheet(row)
  }

  const smsBody = onCalendar
    ? `BOOKED ${businessName()}: ${name || 'Caller'} ${phone} ${when} ${address} — ${issue}`
    : `JOB REQUEST ${businessName()} (calendar not connected): ${name || 'Caller'} ${phone} ${when} ${address} — ${issue}`
  const sms = await smsOwner(smsBody)
  await emailOwner({
    ...row,
    _subject: `${onCalendar ? 'Booked' : 'Job request'} ${businessName()}: ${name || phone} ${when}`,
    _replyto: 'email@vox.chat',
    _format: 'plain',
  })

  const result = onCalendar
    ? {
        ok: true,
        booked: true,
        calendar: true,
        when: event.when || when,
        marker: 'VOX_BOOKED',
        sms: sms.ok ? 'sent' : sms.error || 'failed',
        say: `Booked. Tell them they are on the schedule for ${event.when || when}.`,
      }
    : {
        ok: true,
        booked: false,
        saved: true,
        calendar: false,
        when,
        error: event.error || 'calendar_not_configured',
        marker: 'VOX_BOOKED',
        sms: sms.ok ? 'sent' : sms.error || 'failed',
        say: event.error === 'calendar_not_configured'
          ? `Saved the request for ${when}, but Google Calendar is not connected, so it is not on the schedule yet. Tell them ${businessName()} will confirm that time.`
          : `Saved the request for ${when}, but the calendar did not accept it. Tell them ${businessName()} will confirm that time.`,
      }

  remember(key, result)
  console.log('[voice-dispatch] book', {
    when,
    calendar: result.calendar,
    sms: result.sms,
    callId: callId || null,
  })
  return result
}

function transcriptBlob(payload) {
  const parts = []
  if (payload?.artifact?.transcript) parts.push(String(payload.artifact.transcript))
  if (payload?.transcript) parts.push(String(payload.transcript))
  const msgs = payload?.artifact?.messages || payload?.messages || []
  if (Array.isArray(msgs)) {
    for (const m of msgs) {
      parts.push(m.content || m.message || m.result || m.text || '')
    }
  }
  return parts.join('\n')
}

function phoneFromBlob(blob) {
  const m = String(blob || '').match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
  return m ? m[0] : ''
}

/** End-of-call backup when the assistant never called the tool. */
export async function maybeDispatchFromCall(payload) {
  const blob = transcriptBlob(payload)
  if (/VOX_EMERGENCY_SENT|VOX_BOOKED/.test(blob)) return { handled: false }
  const analysis = payload?.analysis || {}
  const structured =
    analysis.structuredData || analysis.structured_data || payload?.structuredData || {}
  const callId = payload?.call?.id || payload?.callId || ''
  const issue = clean(structured.issue || structured.notes || '', 300)
  const phone = clean(structured.phone || structured.phoneNumber || phoneFromBlob(blob), 40)
  const name = clean(structured.name || structured.customerName || '', 80)
  const address = clean(structured.address || '', 160)

  if (looksLikeEmergency({ emergency: structured.emergency, issue, transcript: blob }) && phone) {
    const out = await flagEmergency({ name, phone, address, issue: issue || 'Emergency from call' }, callId)
    return { handled: Boolean(out.ok), kind: 'emergency', out }
  }

  const start = structured.start || structured.appointment || structured.requestedTime || ''
  if (start && phone && address) {
    const out = await bookJob({ name, phone, address, issue, start }, callId)
    if (out.booked || out.saved) return { handled: true, kind: 'book', out }
  }
  return { handled: false }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      webhook: 'voice-dispatch',
      calendar: calendarConfigured(),
      tools: ['flagEmergency', 'bookJob'],
    })
    return
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const secret = process.env.VAPI_WEBHOOK_SECRET
  if (secret) {
    const hdr = req.headers['x-vapi-secret'] || req.headers['x-webhook-secret']
    if (hdr !== secret) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
  }

  try {
    const body = await readBody(req)
    const message = unwrap(body)
    const { toolCallId, name, args } = extractToolArgs(message)
    const callId = clean(message?.call?.id || body?.call?.id || '', 80)
    const tool = (name || args.tool || '').toLowerCase()

    let result
    if (tool === 'flagemergency' || tool === 'flag_emergency') result = await flagEmergency(args, callId)
    else if (tool === 'bookjob' || tool === 'book_job') result = await bookJob(args, callId)
    else if (looksLikeEmergency(args)) result = await flagEmergency(args, callId)
    else {
      result = { ok: false, say: 'Unknown tool. Use flagEmergency or bookJob.' }
    }

    if (toolCallId) {
      res.status(200).json({ results: [{ toolCallId, result: JSON.stringify(result) }] })
      return
    }
    res.status(200).json(result)
  } catch (e) {
    console.error('[voice-dispatch]', e)
    res.status(200).json({
      results: [
        {
          toolCallId: 'unknown',
          result: JSON.stringify({
            ok: false,
            say: 'The schedule tool failed. Collect the details and say the owner will confirm.',
          }),
        },
      ],
    })
  }
}
