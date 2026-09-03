/**
 * Vercel serverless — POST /api/voice-webhook
 * Vapi server URL: end-of-call-report → lead fan-out.
 * Auth: VAPI_WEBHOOK_SECRET required in production (fail closed).
 */
import { deliverLead } from './_lib/leads.js'
import {
  clean,
  handleOptions,
  healthPayload,
  jsonError,
  logSafe,
  parseBody,
  readRawBody,
  setNoStore,
  verifyVapiWebhook,
} from './_lib/security.js'
import { normalizePhone } from './reviewsShared.js'

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
  const structured = analysis.structuredData || analysis.structured_data || payload.structuredData || {}

  let name = clean(structured.name || structured.customerName || '', 120)
  let phone = clean(structured.phone || structured.phoneNumber || structured.callback || '', 40)
  let email = clean(structured.email || '', 120)
  let business = clean(structured.business || structured.company || '', 120)
  let city = clean(structured.city || structured.serviceArea || '', 80)
  let trade = clean(structured.trade || structured.industry || '', 40)
  let interest = clean(structured.interest || structured.product || '', 40)
  let notes = clean(structured.notes || analysis.summary || payload.summary || '', 400)

  const transcript = transcriptText(payload)

  if (!phone) {
    const m = transcript.match(/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)
    if (m) phone = m[0]
  }
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
    notes = clean(`${notes}${notes ? ' | ' : ''}call=${callId}`.trim(), 400)
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

export default async function handler(req, res) {
  setNoStore(res)
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    res.status(200).json(healthPayload('voice-webhook'))
    return
  }

  if (req.method !== 'POST') {
    jsonError(res, 405, 'Method not allowed')
    return
  }

  try {
    const raw = await readRawBody(req)
    const auth = verifyVapiWebhook(req, raw)
    if (!auth.ok) {
      logSafe('[voice-webhook] auth', { code: auth.code })
      jsonError(res, auth.status || 401, 'Unauthorized', { code: auth.code })
      return
    }
    if (auth.insecure) {
      logSafe('[voice-webhook] insecure', { msg: 'VAPI_WEBHOOK_SECRET unset; allowing only outside production' })
    }

    const body = parseBody(req, raw).value || {}
    const { type, payload } = unwrapMessage(body)

    const isEnd =
      type === 'end-of-call-report' ||
      type === 'end-of-call-report-message' ||
      (payload?.artifact && (payload?.analysis || payload?.endedReason)) ||
      payload?.endedReason

    if (isEnd) {
      const lead = extractLeadFromPayload(payload || {})
      if (lead.phone || lead.email || (lead.name && lead.name !== 'Voice caller')) {
        const delivered = await deliverLead(lead)
        logSafe('[voice-webhook] lead', { ok: delivered.ok, channels: delivered.channels, source: 'live-voice' })
        if (!delivered.ok) {
          res.status(500).json({ ok: false, error: 'persist_failed' })
          return
        }
        res.status(200).json({ ok: true, notified: delivered.channels })
        return
      }
      logSafe('[voice-webhook] end-of-call', { empty: true, type })
      res.status(200).json({ ok: true, notified: [] })
      return
    }

    res.status(200).json({ ok: true, ignored: type || 'unknown' })
  } catch (e) {
    logSafe('[voice-webhook]', { err: e && e.message })
    res.status(500).json({ ok: false, error: 'processed with error' })
  }
}
