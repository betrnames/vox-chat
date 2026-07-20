/**
 * Vercel serverless — POST /api/lead
 * Direct lead capture (email + optional sheet). Self-contained.
 */

type CapturedLead = {
  name?: string
  phone?: string
  email?: string
  business?: string
  city?: string
  trade?: string
  interest?: string
  notes?: string
  source?: string
}

function clean(s: unknown, max = 200): string {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

export default async function handler(
  req: { method?: string; body?: unknown },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
    setHeader: (k: string, v: string) => void
  },
) {
  try {
    res.setHeader('Cache-Control', 'no-store')

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const body = (typeof req.body === 'string' ? JSON.parse(req.body as string) : req.body || {}) as CapturedLead
    if (!body?.phone && !body?.email) {
      return res.status(400).json({ error: 'phone or email required' })
    }

    const channels: string[] = []
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
      _subject: `[Vox Lead] ${clean(body.interest) || 'Lead'} — ${clean(body.name) || clean(body.phone) || 'new'}`,
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
    } catch {
      /* non-fatal */
    }

    const sheetUrl = process.env.LEAD_SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL
    if (sheetUrl) {
      try {
        const raw = JSON.stringify(payload)
        let r = await fetch(sheetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: raw,
          redirect: 'manual',
        })
        const loc = r.headers.get('location')
        if (loc && (r.status === 301 || r.status === 302 || r.status === 307 || r.status === 308)) {
          r = await fetch(loc, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: raw,
          })
        }
        if (r.ok || r.status === 200 || r.status === 302) channels.push('sheet')
      } catch {
        /* non-fatal */
      }
    }

    return res.status(channels.length ? 200 : 502).json({ ok: channels.length > 0, channels })
  } catch (e) {
    console.error('[lead]', e)
    return res.status(500).json({ error: 'Server error', ok: false, channels: [] })
  }
}
