/**
 * Vercel serverless — POST /api/lead
 * CommonJS, self-contained.
 */

function clean(s, max) {
  max = max || 200
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

module.exports = async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    var body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    if (!body.phone && !body.email) {
      return res.status(400).json({ error: 'phone or email required' })
    }

    var channels = []
    var payload = {
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
        '[Vox Lead] ' +
        (clean(body.interest) || 'Lead') +
        ' — ' +
        (clean(body.name) || clean(body.phone) || 'new'),
      timestamp: new Date().toISOString(),
    }

    var formspree = process.env.FORMSPREE_ENDPOINT || 'https://formspree.io/f/mwvdpgay'
    try {
      var r = await fetch(formspree, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.ok) channels.push('email')
    } catch (e) {
      /* non-fatal */
    }

    var sheetUrl = process.env.LEAD_SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL
    if (sheetUrl) {
      try {
        var raw = JSON.stringify(payload)
        var r2 = await fetch(sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: raw,
          redirect: 'manual',
        })
        var loc = r2.headers.get('location')
        if (loc && (r2.status === 301 || r2.status === 302 || r2.status === 307 || r2.status === 308)) {
          r2 = await fetch(loc, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: raw,
          })
        }
        if (r2.ok || r2.status === 200 || r2.status === 302) channels.push('sheet')
      } catch (e) {
        /* non-fatal */
      }
    }

    return res.status(channels.length ? 200 : 502).json({ ok: channels.length > 0, channels: channels })
  } catch (e) {
    console.error('[lead]', e)
    return res.status(500).json({ error: 'Server error', ok: false, channels: [] })
  }
}
