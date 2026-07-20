/**
 * Vercel serverless — POST /api/voice-webhook
 * Vapi server URL: end-of-call-report → Formspree + Google Sheet + optional SMS.
 *
 * Dashboard: Assistant → Server URL → https://vox.chat/api/voice-webhook
 */
import { writeLeadToSheet } from './googleSheet.js'
import { normalizePhone, sendTwilioSms, twilioConfigured } from './reviewsShared.js'

function clean(s, max = 200) {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
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

/** Normalize Vapi webhook shapes */
function unwrapMessage(body) {
  if (!body || typeof body !== 'object') return { type: '', payload: body }
  if (body.message && typeof body.message === 'object') {
    return { type: body.message.type || body.type || '', payload: body.message }
  }
  return { type: body.type || '', payload: body }
}

function transcriptText(payload) {
  if (payload.artifact?.transcript) return String(payload.artifact.transcript)
  if (payload.transcript) return String(payload.transcript)
  const msgs = payload.artifact?.messages || payload.messages || []
  if (!Array.isArray(msgs)) return ''
  return msgs
    .map((m) => {
      const role = m.role || m.speaker || ''
      const content = m.content || m.message || m.text || ''
      return `${role}: ${content}`
    })
    .join('\n')
}

function extractLeadFromPayload(payload) {
  const analysis = payload.analysis || {}
  const structured =
    analysis.structuredData ||
    analysis.structured_data ||
    payload.structuredData ||
    {}

  let name = clean(structured.name || structured.customerName || '', 120)
  let phone = clean(structured.phone || structured.phoneNumber || structured.callback || '', 40)
  let email = clean(structured.email || '', 120)
  let business = clean(structured.business || structured.company || '', 120)
  let city = clean(structured.city || structured.serviceArea || '', 80)
  let trade = clean(structured.trade || structured.industry || '', 40)
  let interest = clean(structured.interest || structured.product || '', 40)
  let notes = clean(structured.notes || analysis.summary || payload.summary || '', 500)

  const transcript = transcriptText(payload)

  // Fallback: crude phone from transcript
  if (!phone) {
    const m = transcript.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
    if (m) phone = m[0]
  }
  // Fallback: "my name is X"
  if (!name) {
    const m = transcript.match(/(?:my name is|this is|i'm|i am)\s+([A-Za-z][A-Za-z'\-]+(?:\s+[A-Za-z][A-Za-z'\-]+)?)/i)
    if (m) name = m[1]
  }
  if (!interest) {
    const t = transcript.toLowerCase()
    if (/\bbundle\b|all three/.test(t)) interest = 'bundle'
    else if (/\breview/.test(t)) interest = 'reviews'
    else if (/\breceptionist\b|website|chat/.test(t)) interest = 'receptionist'
    else if (/\bvoice\b|phone|missed call|after.?hours/.test(t)) interest = 'voice'
    else interest = 'audit'
  }

  const callId = payload.call?.id || payload.callId || ''
  if (callId && !notes.includes(callId)) {
    notes = clean(`${notes}${notes ? ' | ' : ''}call=${callId}`.trim(), 500)
  }

  phone = normalizePhone(phone) || clean(phone, 40)

  return {
    name,
    phone,
    email,
    business,
    city,
    trade: trade || 'unknown',
    interest: interest || 'unknown',
    notes: notes || 'voice call completed',
    source: 'live-voice',
  }
}

async function notifyLead(lead) {
  const channels = []
  const payload = {
    name: lead.name || 'Voice caller',
    phone: lead.phone || '',
    email: lead.email || '',
    business: lead.business || '',
    city: lead.city || '',
    trade: lead.trade || '',
    interest: lead.interest || 'voice',
    notes: lead.notes || '',
    source: 'live-voice',
    site: 'vox.chat',
    _subject: `Vox Voice lead: ${lead.interest || 'call'} — ${lead.name || lead.phone || 'new'}`,
    _replyto: lead.email || 'email@vox.chat',
    _format: 'plain',
    timestamp: new Date().toISOString(),
  }

  if (!payload.phone && !payload.email && !payload.name) {
    return channels
  }

  const formspree =
    process.env.FORMSPREE_ENDPOINT ||
    process.env.VITE_FORMSPREE_ENDPOINT ||
    'https://formspree.io/f/mwvdpgay'

  try {
    const r = await fetch(formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (r.ok) channels.push('email')
  } catch (e) {
    console.error('[voice-webhook] formspree', e)
  }

  try {
    const ok = await writeLeadToSheet(payload)
    if (ok) channels.push('sheet')
  } catch (e) {
    console.error('[voice-webhook] sheet', e)
  }

  const owner = normalizePhone(process.env.REVIEW_OWNER_PHONE || '')
  if (owner && twilioConfigured() && payload.phone) {
    const body = `Vox Voice lead: ${payload.name} · ${payload.phone}${
      payload.interest ? ` · ${payload.interest}` : ''
    }${payload.notes ? ` · ${payload.notes.slice(0, 80)}` : ''} — call them back`
    // Trial uses templates; free-form after TWILIO_TRIAL=false
    const result = await sendTwilioSms(owner, body, { kind: 'owner_alert' })
    if (result.ok) channels.push('sms')
  }

  return channels
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, webhook: 'voice-webhook', product: 'vox-voice' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = await readBody(req)
    const { type, payload } = unwrapMessage(body)

    // Optional shared secret (if you set a custom header in Vapi)
    const secret = process.env.VAPI_WEBHOOK_SECRET
    if (secret) {
      const hdr = req.headers['x-vapi-secret'] || req.headers['x-webhook-secret']
      if (hdr !== secret) {
        res.status(401).json({ error: 'Unauthorized' })
        return
      }
    }

    if (type === 'end-of-call-report' || type === 'end-of-call-report-message' || payload?.endedReason || payload?.artifact) {
      // Prefer explicit end-of-call; also accept payloads that look like call reports
      const isEnd =
        type === 'end-of-call-report' ||
        type === 'end-of-call-report-message' ||
        (payload?.artifact && (payload?.analysis || payload?.endedReason))

      if (isEnd || type === 'end-of-call-report') {
        const lead = extractLeadFromPayload(payload)
        // Only notify if we have something useful
        if (lead.phone || lead.email || (lead.name && lead.name !== 'Voice caller')) {
          const channels = await notifyLead(lead)
          console.log('[voice-webhook] lead', { ...lead, channels })
          res.status(200).json({ ok: true, notified: channels })
          return
        }
        console.log('[voice-webhook] end-of-call no lead fields', type)
        res.status(200).json({ ok: true, notified: [] })
        return
      }
    }

    // Ack everything else so Vapi doesn't retry forever
    res.status(200).json({ ok: true, ignored: type || 'unknown' })
  } catch (e) {
    console.error('[voice-webhook]', e)
    res.status(200).json({ ok: false, error: 'processed with error' })
  }
}
