/**
 * Vercel serverless — POST /api/lead
 * Direct lead capture (email + Google Sheet).
 */
import { writeLeadToSheet } from './googleSheet.js'

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

    return res.status(channels.length ? 200 : 502).json({ ok: channels.length > 0, channels })
  } catch (e) {
    console.error('[lead]', e)
    return res.status(500).json({ error: 'Server error', ok: false, channels: [] })
  }
}
