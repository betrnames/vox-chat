/**
 * Vercel serverless — POST /api/lead
 * Direct lead capture (email + Google Sheet).
 */
import { writeLeadToSheet } from './googleSheet.js'
import { twilioConfigured, sendTwilioSms, normalizePhone } from './reviewsShared.js'
import {
  clean,
  getClientIp,
  checkRateLimit,
  fetchWithTimeout,
  reqId,
} from './_lib.js'

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000

export default async function handler(req, res) {
  const id = reqId()
  try {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const ip = getClientIp(req)
    if (!checkRateLimit(ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)) {
      console.warn('[lead]', id, 'rate_limited', ip)
      return res.status(429).json({ error: 'Too many requests', ok: false, id })
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    if (!body.phone && !body.email) {
      return res.status(400).json({ error: 'phone or email required', id })
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

    const formspree = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/xzezgyen'
    try {
      const r = await fetchWithTimeout(
        formspree,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload),
        },
        10_000,
      )
      if (r.ok) channels.push('email')
    } catch (e) {
      console.error('[lead]', id, 'formspree', e.name === 'AbortError' ? 'timeout' : e.message)
    }

    try {
      const sheetChannel = await writeLeadToSheet(payload)
      if (sheetChannel) channels.push(sheetChannel)
    } catch (e) {
      console.error('[lead]', id, 'sheet', e.message)
    }

    // SMS alert to owner
    const ownerPhone = normalizePhone(process.env.REVIEW_OWNER_PHONE)
    if (twilioConfigured() && ownerPhone) {
      try {
        const smsBody = `New Vox.chat lead (web form): ${payload.name} - ${payload.phone || payload.email}. Interest: ${payload.interest || 'unknown'}.`
        const smsResult = await sendTwilioSms(ownerPhone, smsBody, { kind: 'owner_alert' })
        if (smsResult.ok) channels.push('sms')
      } catch (e) {
        console.error('[lead]', id, 'sms', e.message)
      }
    }

    console.log('[lead]', id, { channels, interest: payload.interest })
    return res.status(channels.length ? 200 : 502).json({ ok: channels.length > 0, channels, id })
  } catch (e) {
    console.error('[lead]', id, e.message)
    return res.status(500).json({ error: 'Server error', ok: false, channels: [], id })
  }
}
