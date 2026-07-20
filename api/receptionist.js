/**
 * Vercel serverless â€” POST /api/receptionist
 * CommonJS (no package "type":"module" issues). Self-contained.
 */

const DEMO_PROMPT = `You are the AI Receptionist for Valley Air Pros, a sample HVAC / plumbing / electrical contractor serving Manteca, Turlock, Modesto, Stockton, Tracy, Lathrop, Ripon, Escalon, and Oakdale in California's Central Valley (209 area code).

ROLE
- Front-desk receptionist for customers, not a general assistant.
- Help with scheduling, rough pricing, or service areas.
- Stay in character. Never mention being a language model.

CONVERSATION RAILS
1. One question at a time when collecting info.
2. For booking gather: service need, phone, preferred window.
3. When you have service + phone + time, confirm booking and that the contractor gets a text.
4. Rough pricing if asked: repairs $180â€“$450; installs quoted on-site.
5. Keep replies short (2â€“4 sentences). English/Spanish OK.
6. This is a product demo on vox.chat â€” finish real booking flows.`

const LIVE_PROMPT = `You are the AI Receptionist for Vox.chat â€” AI automation for HVAC, plumbing, and electrical contractors in California's Central Valley (Turlock, Modesto, Manteca, Stockton, Tracy and nearby 209 corridor).

WHO YOU REPRESENT
- Owner: Gabe Mariscal (Turlock). Product: AI front desk â€” Voice, Receptionist (this chat), Reviews. Bundle $1,500/mo; tools from $300â€“$1,500/mo. Month-to-month.
- You are NOT a lead-gen agency. You automate answering calls, visitor chats, and review follow-ups.

YOUR JOB
1. Learn what they need (missed calls, website visitors, Google reviews, or bundle).
2. Qualify lightly: trade, city, crew size, biggest pain.
3. Collect: name, best phone, optional email/business.
4. Offer free 15-minute Missed Call Audit.
5. When you have name + phone + interest, confirm you'll notify Gabe.

RAILS
- One question at a time. Short replies (2â€“4 sentences). Direct, premium, zero fluff.
- Pricing if asked: Reviews $300â€“$500/mo, Receptionist $500â€“$800/mo, Voice $800â€“$1,500/mo, Bundle $1,500/mo. Paid to start.
- English/Spanish OK.

LEAD CAPTURE
When you have at least a phone AND (name OR business) AND clear interest, append EXACTLY one line at the very end:

<<<LEAD>>>{"name":"string","phone":"string","email":"string or empty","business":"string or empty","city":"string or empty","trade":"hvac|plumbing|electrical|other|unknown","interest":"voice|receptionist|reviews|bundle|audit|unknown","notes":"one-line summary"}<<<END>>>

Only emit once when complete enough. Do not invent phone numbers.`

function clean(s, max) {
  max = max || 200
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

function extractLead(raw) {
  const re = /<<<LEAD>>>\s*([\s\S]*?)\s*<<<END>>>/i
  const m = raw.match(re)
  if (!m) return { cleanReply: raw.trim(), lead: null }
  const cleanReply = raw.replace(re, '').trim()
  try {
    const parsed = JSON.parse(m[1].trim())
    return {
      cleanReply: cleanReply,
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
  } catch (e) {
    return { cleanReply: cleanReply, lead: null }
  }
}

async function notifyLead(lead) {
  const channels = []
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
    _subject:
      '[Vox Lead] ' +
      (clean(lead.interest) || 'Receptionist') +
      ' â€” ' +
      (clean(lead.name) || clean(lead.phone) || 'new'),
    timestamp: new Date().toISOString(),
  }

  if (!payload.phone && !payload.email) return channels

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

  const sheetUrl = process.env.LEAD_SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL
  if (sheetUrl) {
    try {
      const body = JSON.stringify(payload)
      let r = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: body,
        redirect: 'manual',
      })
      const loc = r.headers.get('location')
      if (loc && (r.status === 301 || r.status === 302 || r.status === 307 || r.status === 308)) {
        r = await fetch(loc, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: body,
        })
      }
      if (r.ok || r.status === 200 || r.status === 302) channels.push('sheet')
    } catch (e) {
      /* non-fatal */
    }
  }

  return channels
}

function modelName() {
  return process.env.XAI_MODEL || 'grok-3-mini'
}

export default async function handler(req, res) {
  try {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      return res.status(204).end()
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        ok: true,
        service: 'receptionist',
        hasKey: Boolean(process.env.XAI_API_KEY),
      })
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      return res.status(503).json({ error: 'XAI_API_KEY not configured', fallback: true })
    }

    let body = {}
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' })
    }

    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages required' })
    }

    const mode = body.mode === 'live' ? 'live' : 'demo'
    const trimmed = messages
      .filter(function (m) {
        return m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
      })
      .slice(-16)
      .map(function (m) {
        return { role: m.role, content: String(m.content).slice(0, 2000) }
      })

    if (trimmed.length === 0) {
      return res.status(400).json({ error: 'messages required' })
    }

    const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: modelName(),
        temperature: mode === 'live' ? 0.4 : 0.5,
        max_tokens: 450,
        messages: [{ role: 'system', content: mode === 'live' ? LIVE_PROMPT : DEMO_PROMPT }].concat(trimmed),
      }),
    })

    if (!upstream.ok) {
      const errText = await upstream.text().catch(function () {
        return ''
      })
      console.error('[receptionist] xAI error', upstream.status, errText.slice(0, 400))
      return res.status(502).json({
        error: 'Upstream AI error',
        fallback: true,
        status: upstream.status,
      })
    }

    const data = await upstream.json()
    const raw = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    const replyRaw = raw && String(raw).trim()
    if (!replyRaw) {
      return res.status(502).json({ error: 'Empty AI response', fallback: true })
    }

    if (mode !== 'live') {
      return res.status(200).json({ reply: replyRaw })
    }

    const extracted = extractLead(replyRaw)
    var notified
    if (extracted.lead && (extracted.lead.phone || extracted.lead.email)) {
      extracted.lead.source = body.source || 'live-receptionist'
      notified = await notifyLead(extracted.lead)
    }

    return res.status(200).json({ reply: extracted.cleanReply, lead: extracted.lead, notified: notified })
  } catch (e) {
    console.error('[receptionist] uncaught', e)
    return res.status(500).json({
      error: 'Server error',
      fallback: true,
      message: e && e.message ? e.message : 'unknown',
    })
  }
}

