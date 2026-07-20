/**
 * Vercel serverless — POST /api/reviews-inbound
 * Twilio Messaging webhook: customer replies 1–5 after review request.
 *
 * Configure on the Twilio number:
 *   A message comes in → https://vox.chat/api/reviews-inbound  (HTTP POST)
 */
import { writeLeadToSheet } from './googleSheet.js'
import {
  clean,
  normalizePhone,
  pendingReviews,
  positiveFollowUpBody,
  negativeFollowUpBody,
  sendTwilioSms,
  twilioConfigured,
  useTrialTemplates,
} from './reviewsShared.js'

function parseFormBody(raw) {
  const params = new URLSearchParams(raw || '')
  const out = {}
  for (const [k, v] of params.entries()) out[k] = v
  return out
}

function parseRating(bodyText) {
  const t = String(bodyText || '').trim()
  const m = t.match(/\b([1-5])\b/)
  if (!m) return null
  return Number(m[1])
}

async function notifyOwner(payload) {
  const formspree =
    process.env.FORMSPREE_ENDPOINT ||
    process.env.VITE_FORMSPREE_ENDPOINT ||
    'https://formspree.io/f/mwvdpgay'

  const body = {
    name: payload.name || 'Customer',
    phone: payload.phone || '',
    business: payload.business || '',
    interest: 'reviews',
    notes: payload.notes || '',
    source: 'live-reviews-negative',
    site: 'vox.chat',
    _subject: payload._subject || 'Vox Reviews: negative path — call customer',
    _format: 'plain',
  }

  try {
    await fetch(formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    console.error('[reviews-inbound] formspree', e)
  }

  try {
    await writeLeadToSheet({
      ...body,
      timestamp: new Date().toISOString(),
    })
  } catch (e) {
    console.error('[reviews-inbound] sheet', e)
  }

  const ownerPhone = normalizePhone(process.env.REVIEW_OWNER_PHONE || '')
  if (ownerPhone && twilioConfigured()) {
    const alert = `Owner alert: ${body.name} rated ${payload.rating}/5${
      payload.business ? ` · ${payload.business}` : ''
    }. Phone ${body.phone}. Call before this becomes a public review. — Vox Reviews`
    await sendTwilioSms(ownerPhone, alert, { kind: 'owner_alert' })
  }
}

function twiml(message) {
  const escaped = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`
}

async function readRawBody(req) {
  if (typeof req.body === 'string') return req.body
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    // Already parsed object (JSON or form)
    return null
  }
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({ ok: true, webhook: 'reviews-inbound' })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).end('Method not allowed')
    return
  }

  let fields = {}
  const raw = await readRawBody(req)
  if (raw != null) {
    fields = parseFormBody(raw)
  } else if (req.body && typeof req.body === 'object') {
    fields = req.body
  }

  const from = normalizePhone(fields.From || fields.from || '')
  const text = clean(fields.Body || fields.body || '', 320)
  const rating = parseRating(text)

  let reply =
    'Thanks for texting Vox Reviews. Reply with a single number 1–5 to rate your service, or call (209) 996-7102.'

  if (!from) {
    res.setHeader('Content-Type', 'text/xml')
    res.status(200).send(twiml(reply))
    return
  }

  const pending = pendingReviews.get(from)

  if (rating == null) {
    res.setHeader('Content-Type', 'text/xml')
    res.status(200).send(twiml(reply))
    return
  }

  const name = pending?.name || ''
  const business = pending?.business || ''
  const positive = rating >= 4

  if (positive) {
    reply = positiveFollowUpBody(name)
    pendingReviews.delete(from)

    writeLeadToSheet({
      name: name || 'Customer',
      phone: from,
      business,
      interest: 'reviews',
      notes: `positive_${rating} | google_link_sent | trial_templates=${useTrialTemplates()}`,
      source: 'live-reviews',
      timestamp: new Date().toISOString(),
    }).catch(() => {})
  } else {
    reply = negativeFollowUpBody()
    pendingReviews.delete(from)

    notifyOwner({
      name: name || 'Customer',
      phone: from,
      business,
      rating,
      notes: `negative_${rating} | google_link_blocked | private recovery`,
      _subject: `Vox Reviews ALERT: ${name || from} rated ${rating}/5`,
    }).catch(() => {})
  }

  // Trial cannot put free-form text in TwiML <Message> — send via API with template name
  if (useTrialTemplates()) {
    await sendTwilioSms(from, reply, { kind: positive ? 'positive' : 'negative' })
    res.setHeader('Content-Type', 'text/xml')
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
    return
  }

  res.setHeader('Content-Type', 'text/xml')
  res.status(200).send(twiml(reply))
}
