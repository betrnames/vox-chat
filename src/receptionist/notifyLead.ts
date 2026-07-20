export type CapturedLead = {
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

/** Server env only (Vite middleware / Vercel). Avoids browser process types. */
function serverEnv(key: string): string | undefined {
  const g = globalThis as { process?: { env?: Record<string, string | undefined> } }
  return g.process?.env?.[key]
}

/** Email via Formspree + optional Google Sheet Apps Script webhook. Zero paid infra. */
export async function notifyLead(lead: CapturedLead): Promise<{ ok: boolean; channels: string[] }> {
  const channels: string[] = []
  const payload = {
    name: clean(lead.name, 120) || 'Unknown',
    phone: clean(lead.phone, 40),
    email: clean(lead.email, 120),
    business: clean(lead.business, 120),
    city: clean(lead.city, 80),
    trade: clean(lead.trade, 40),
    interest: clean(lead.interest, 40),
    notes: clean(lead.notes, 500),
    source: clean(lead.source, 80) || 'live-receptionist',
    site: 'vox.chat',
    _subject: `Vox.chat lead: ${clean(lead.interest) || 'Receptionist'} - ${clean(lead.name) || clean(lead.phone) || 'new'}`,
    _replyto: clean(lead.email, 120) || 'email@vox.chat',
    _format: 'plain',
  }

  if (!payload.phone && !payload.email) {
    return { ok: false, channels }
  }

  const formspree =
    serverEnv('FORMSPREE_ENDPOINT') ||
    serverEnv('VITE_FORMSPREE_ENDPOINT') ||
    'https://formspree.io/f/mwvdpgay'

  try {
    const r = await fetch(formspree, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (r.ok) channels.push('email')
  } catch {
    /* continue to sheet */
  }

  const sheetUrl = serverEnv('LEAD_SHEET_WEBHOOK_URL') || serverEnv('GOOGLE_SHEET_WEBHOOK_URL')
  if (sheetUrl) {
    try {
      const body = JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      })
      // Apps Script web apps often 302; follow redirect while keeping POST
      let r = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
        redirect: 'manual',
      })
      const loc = r.headers.get('location')
      if (loc && (r.status === 301 || r.status === 302 || r.status === 307 || r.status === 308)) {
        r = await fetch(loc, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body,
        })
      }
      if (r.ok || r.status === 200 || r.status === 302) channels.push('sheet')
    } catch {
      /* non-fatal */
    }
  }

  return { ok: channels.length > 0, channels }
}

/** Parse <<<LEAD>>>{...}<<<END>>> trailer from model output. */
export function extractLeadFromReply(raw: string): { cleanReply: string; lead: CapturedLead | null } {
  const re = /<<<LEAD>>>\s*([\s\S]*?)\s*<<<END>>>/i
  const m = raw.match(re)
  if (!m) return { cleanReply: raw.trim(), lead: null }

  const cleanReply = raw.replace(re, '').trim()
  try {
    const parsed = JSON.parse(m[1].trim()) as CapturedLead
    return {
      cleanReply,
      lead: {
        name: clean(parsed.name),
        phone: clean(parsed.phone, 40),
        email: clean(parsed.email, 120),
        business: clean(parsed.business),
        city: clean(parsed.city, 80),
        trade: clean(parsed.trade, 40),
        interest: clean(parsed.interest, 40),
        notes: clean(parsed.notes, 500),
      },
    }
  } catch {
    return { cleanReply, lead: null }
  }
}
