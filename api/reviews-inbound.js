/**
 * Vercel serverless — POST /api/reviews-inbound
 * Twilio Messaging webhook. Signature required in production.
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
  verifyTwilioSignature,
} from './_lib/security.js'
import {
  normalizePhone,
  pendingReviews,
  positiveFollowUpBody,
  negativeFollowUpBody,
  sendTwilioSms,
  twilioConfigured,
  useTrialTemplates,
} from './reviewsShared.js'

function parseRating(bodyText) {
  const t = String(bodyText || '').trim()
  const m = t.match(/\b([1-5])\b/)
  if (!m) return null
  return Number(m[1])
}

function twiml(message) {
  const escaped = String(message)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`
}

export default async function handler(req, res) {
  setNoStore(res)
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    res.status(200).json(healthPayload('reviews-inbound'))
    return
  }

  if (req.method !== 'POST') {
    jsonError(res, 405, 'Method not allowed')
    return
  }

  let fields = {}
  try {
    const raw = await readRawBody(req)
    const parsed = parseBody(req, raw)
    fields = parsed.value || {}
  } catch (e) {
    logSafe('[reviews-inbound] body', { err: e && e.message })
    res.setHeader('Content-Type', 'text/xml')
    res.status(200).send(twiml('Thanks.'))
    return
  }

  const auth = verifyTwilioSignature(req, fields)
  if (!auth.ok) {
    logSafe('[reviews-inbound] auth', { code: auth.code })
    jsonError(res, auth.status || 401, 'Unauthorized', { code: auth.code })
    return
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

    deliverLead({
      name: name || 'Customer',
      phone: from,
      business,
      interest: 'reviews',
      notes: `positive_${rating} | google_link_sent`,
      source: 'live-reviews',
    }).catch(() => {})
  } else {
    reply = negativeFollowUpBody()
    pendingReviews.delete(from)

    deliverLead({
      name: name || 'Customer',
      phone: from,
      business,
      interest: 'reviews',
      notes: `negative_${rating} | google_link_blocked | private recovery`,
      source: 'live-reviews-negative',
    }).catch(() => {})

    const ownerPhone = normalizePhone(process.env.REVIEW_OWNER_PHONE || '')
    if (ownerPhone && twilioConfigured()) {
      const alert = `Owner alert: ${name || 'Customer'} rated ${rating}/5${
        business ? ` · ${business}` : ''
      }. Phone ${from}. Call before this becomes a public review. — Vox Reviews`
      await sendTwilioSms(ownerPhone, alert, { kind: 'owner_alert' })
    }
  }

  if (useTrialTemplates()) {
    await sendTwilioSms(from, reply, { kind: positive ? 'positive' : 'negative' })
    res.setHeader('Content-Type', 'text/xml')
    res.status(200).send('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
    return
  }

  res.setHeader('Content-Type', 'text/xml')
  res.status(200).send(twiml(reply))
}
