/**
 * Vercel serverless — POST /api/reviews
 * Live Reviews POC: send satisfaction SMS via Twilio.
 */
import { deliverLead } from './_lib/leads.js'
import {
  browserOriginOk,
  clean,
  handleOptions,
  healthPayload,
  honeypotTriggered,
  jsonError,
  logSafe,
  parseBody,
  rateLimitIp,
  readRawBody,
  rejectCors,
  setCors,
  setNoStore,
} from './_lib/security.js'
import {
  normalizePhone,
  pendingReviews,
  ratingAskBody,
  sendTwilioSms,
  twilioConfigured,
} from './reviewsShared.js'

export default async function handler(req, res) {
  setNoStore(res)
  res.setHeader('Content-Type', 'application/json')
  if (handleOptions(req, res)) return
  if (!setCors(req, res)) return rejectCors(res)

  if (req.method === 'GET') {
    res.status(200).json({ ...healthPayload('vox-reviews'), online: twilioConfigured() })
    return
  }

  if (req.method !== 'POST') {
    jsonError(res, 405, 'Method not allowed')
    return
  }

  if (!browserOriginOk(req)) {
    jsonError(res, 403, 'Forbidden')
    return
  }

  const limited = await rateLimitIp(req, 'reviews', 3, 10 * 60 * 1000)
  if (!limited.ok) {
    jsonError(res, 429, 'Too many review texts from this connection. Try again in a few minutes.', {
      code: 'rate_limit',
    })
    return
  }

  if (!twilioConfigured()) {
    jsonError(res, 503, 'Reviews SMS is temporarily unavailable.', { fallback: true, code: 'offline' })
    return
  }

  let body
  try {
    const raw = await readRawBody(req)
    body = parseBody(req, raw).value || {}
  } catch (e) {
    if (e.statusCode === 413) {
      jsonError(res, 413, 'Payload too large')
      return
    }
    jsonError(res, 400, 'Invalid request')
    return
  }

  if (honeypotTriggered(body)) {
    res.status(200).json({ ok: true })
    return
  }

  const phone = normalizePhone(body.phone)
  if (!phone) {
    jsonError(res, 400, 'Enter a valid US mobile number.')
    return
  }

  const name = clean(body.name, 80)
  const business = clean(body.business, 80)
  const smsBody = ratingAskBody(name)

  const result = await sendTwilioSms(phone, smsBody, { kind: 'rating_ask' })
  if (!result.ok) {
    logSafe('[reviews] twilio', { code: result.code })
    jsonError(res, 502, 'Could not send SMS. Try again shortly.', { code: 'twilio_error' })
    return
  }

  pendingReviews.set(phone, { name, business, sentAt: Date.now() })

  deliverLead({
    name: name || 'Customer',
    phone,
    business,
    interest: 'reviews',
    notes: 'review_request_sent | rating ask 1-5',
    source: 'live-reviews',
  }).catch(() => {})

  res.status(200).json({
    ok: true,
    message: 'Review request sent. Reply 1–5 on that text to continue the flow.',
  })
}
