/**
 * Vercel serverless — POST /api/reviews
 * Live Reviews POC: send satisfaction SMS via Twilio.
 *
 * Body: { phone, name?, business? }
 * Env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, GOOGLE_REVIEW_URL
 */
import { writeLeadToSheet } from './googleSheet.js'
import {
  clean,
  normalizePhone,
  pendingReviews,
  ratingAskBody,
  sendTwilioSms,
  twilioConfigured,
} from './reviewsShared.js'

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const rateLimitHits = new Map()

function getClientIp(req) {
  const headers = req.headers || {}
  const xf = headers['x-forwarded-for'] || headers['x-real-ip'] || headers['x-vercel-forwarded-for']
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim()
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).trim()
  return (req.socket && req.socket.remoteAddress) || 'unknown'
}

function checkRateLimit(ip) {
  const now = Date.now()
  let entry = rateLimitHits.get(ip)
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS }
    rateLimitHits.set(ip, entry)
  }
  entry.count += 1
  return entry.count <= RATE_LIMIT_MAX
}

const rateCleanup = setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of rateLimitHits.entries()) {
    if (now >= entry.resetAt) rateLimitHits.delete(ip)
  }
  for (const [phone, row] of pendingReviews.entries()) {
    if (now - row.sentAt > 48 * 60 * 60 * 1000) pendingReviews.delete(phone)
  }
}, RATE_LIMIT_WINDOW_MS)
if (typeof rateCleanup.unref === 'function') rateCleanup.unref()

async function notifyChannels(payload) {
  const formspree =
    process.env.FORMSPREE_ENDPOINT ||
    process.env.VITE_FORMSPREE_ENDPOINT ||
    'https://formspree.io/f/mwvdpgay'

  const body = {
    name: payload.name || 'Reviews POC',
    phone: payload.phone || '',
    email: payload.email || '',
    business: payload.business || '',
    city: payload.city || '',
    trade: payload.trade || '',
    interest: 'reviews',
    notes: payload.notes || '',
    source: payload.source || 'live-reviews',
    site: 'vox.chat',
    _subject: payload._subject || `Vox Reviews: ${payload.notes || 'event'}`,
    _format: 'plain',
  }

  const channels = []
  try {
    const r = await fetch(formspree, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    })
    if (r.ok) channels.push('email')
  } catch (e) {
    console.error('[reviews] formspree', e)
  }

  try {
    const sheetOk = await writeLeadToSheet({
      ...body,
      timestamp: new Date().toISOString(),
    })
    if (sheetOk) channels.push('sheet')
  } catch (e) {
    console.error('[reviews] sheet', e)
  }

  return channels
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      online: twilioConfigured(),
      product: 'vox-reviews',
    })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const ip = getClientIp(req)
  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error: 'Too many review texts from this connection. Try again in a few minutes.',
      code: 'rate_limit',
    })
    return
  }

  if (!twilioConfigured()) {
    res.status(503).json({
      error: 'Reviews SMS not configured yet. Call (209) 996-7102 or email email@vox.chat.',
      fallback: true,
      code: 'twilio_missing',
    })
    return
  }

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = {}
    }
  }
  body = body || {}

  const phone = normalizePhone(body.phone)
  if (!phone) {
    res.status(400).json({ error: 'Enter a valid US mobile number.' })
    return
  }

  const name = clean(body.name, 80)
  const business = clean(body.business, 80)
  // Free-form body used only after upgrade (TWILIO_TRIAL=false). Trial uses sms_feedback_surveys.
  const smsBody = ratingAskBody(name)

  const result = await sendTwilioSms(phone, smsBody, { kind: 'rating_ask' })
  if (!result.ok) {
    res.status(502).json({
      error: result.error || 'Could not send SMS',
      code: result.code || 'twilio_error',
      hint: 'Trial accounts can only text verified numbers.',
    })
    return
  }

  pendingReviews.set(phone, { name, business, sentAt: Date.now() })

  notifyChannels({
    name: name || 'Customer',
    phone,
    business,
    notes: 'review_request_sent | rating ask 1-5',
    source: 'live-reviews',
    _subject: `Vox Reviews: request sent → ${phone}`,
  }).catch(() => {})

  res.status(200).json({
    ok: true,
    phone,
    message: 'Review request sent. Reply 1–5 on that text to continue the flow.',
  })
}
