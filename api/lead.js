/**
 * Vercel serverless — POST /api/lead
 * Direct lead capture (email + Google Sheet).
 */
import { writeLeadToSheet } from './googleSheet.js'
import { twilioConfigured, sendTwilioSms, normalizePhone } from './reviewsShared.js'

const RATE_LIMIT_MAX = 5
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

const rateLimitCleanup = setInterval(function () {
  const now = Date.now()
  for (const [ip, entry] of rateLimitHits.entries()) {
    if (now >= entry.resetAt) rateLimitHits.delete(ip)
  }
}, RATE_LIMIT_WINDOW_MS)
if (typeof rateLimitCleanup.unref === 'function') rateLimitCleanup.unref()

function clean(s, max) {
  max = max || 200
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const ip = getClientIp(req)
    if (!checkRateLimit(ip)) {
      return res.status(429).json({ error: 'Too many requests', ok: false })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    if (!body.phone && !body.email) {
      return res.status(400).json({ error: 'phone or email required' })
    }

    const channels = []
    const payload = {
      name: clean(body.name, 120) || 'Unknown',
      phone: clean(body.phone, 40),
      email: clean(body.email, 120),
      business: clean(body.business, 120),
      city: clean(body.city, 80),
      trade: clean(body.trade, 40),
      interest: clean(body.interest, 40),
      notes: clean(body.notes, 500),
      source: clean(body.source, 80) || 'api-lead',
      site: 'vox.chat',
      _subject:
        'Vox.chat lead: ' +
        (clean(body.interest) || 'Lead') +
        ' - ' +
        (clean(body.name) || clean(body.phone) || 'new'),
      _replyto: clean(body.email, 120) || 'email@vox.chat',
      _format: 'plain',
      timestamp: new Date().toISOString(),
    }

    const formspree = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/mwvdpgay'
    try {
      const r = await fetch(formspree, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.ok) channels.push('email')
    } catch (e) {
      /* non-fatal */
    }

    try {
      const sheetChannel = await writeLeadToSheet(payload)
      if (sheetChannel) channels.push(sheetChannel)
    } catch (e) {
      console.error('[lead] sheet', e)
    }

    // SMS alert to owner
    const ownerPhone = normalizePhone(process.env.REVIEW_OWNER_PHONE)
    if (twilioConfigured() && ownerPhone) {
      try {
        const smsBody = `New Vox.chat lead (web form): ${payload.name} - ${payload.phone || payload.email}. Interest: ${payload.interest || 'unknown'}.`
        const smsResult = await sendTwilioSms(ownerPhone, smsBody, { kind: 'owner_alert' })
        if (smsResult.ok) channels.push('sms')
      } catch (e) {
        console.error('[lead] sms', e)
      }
    }

    return res.status(channels.length ? 200 : 502).json({ ok: channels.length > 0, channels })
  } catch (e) {
    console.error('[lead]', e)
    return res.status(500).json({ error: 'Server error', ok: false, channels: [] })
  }
}
