/**
 * Vercel serverless — POST /api/receptionist
 * Live AI Receptionist + lead notify. Origin-locked, no key leakage.
 */
import { deliverLead } from './_lib/leads.js'
import {
  browserOriginOk,
  clean,
  handleOptions,
  healthPayload,
  jsonError,
  logSafe,
  parseBody,
  rateLimitIp,
  readRawBody,
  rejectCors,
  setCors,
  setNoStore,
  validEmail,
} from './_lib/security.js'

const DEMO_PROMPT = `You are the AI Receptionist for Valley Air Pros, a sample HVAC / plumbing / electrical contractor serving Manteca, Turlock, Modesto, Stockton, Tracy, Lathrop, Ripon, Escalon, and Oakdale in California's Central Valley (209 area code).

ROLE
- Front-desk receptionist for customers, not a general assistant.
- Help with scheduling, rough pricing, or service areas.
- Stay in character. Never mention being a language model.

CONVERSATION RAILS
1. One question at a time when collecting info.
2. For booking gather: service need, phone, preferred window.
3. When you have service + phone + time, confirm booking and that the contractor gets a text.
4. Rough pricing if asked: repairs $180–$450; installs quoted on-site.
5. Keep replies short (2–4 sentences). English/Spanish OK.
6. This is a product demo on vox.chat — finish real booking flows.
7. Do not claim HIPAA, PHI handling, or zero data retention. This demo is not a medical service.`

const LIVE_PROMPT = `You are the AI Receptionist for Vox.chat — AI automation for HVAC, plumbing, and electrical contractors in California's Central Valley (Turlock, Modesto, Manteca, Stockton, Tracy and nearby 209 corridor).

WHO YOU REPRESENT
- Owner: Luis Mariscal (Turlock). Product: AI front desk — Voice, Receptionist (this chat), Reviews. Bundle $895/mo; Receptionist $295, Reviews $395, Voice $595/mo. Month-to-month.
- You are NOT a lead-gen agency. You automate answering calls, visitor chats, and review follow-ups.

YOUR JOB
1. Learn what they need (missed calls, website visitors, Google reviews, or bundle).
2. Qualify lightly: trade, city, crew size, biggest pain.
3. Collect: name, best phone, optional email/business.
4. Offer free 15-minute Missed Call Audit.
5. When you have name + phone + interest, confirm you'll notify Luis.

RAILS
- One question at a time. Short replies (2–4 sentences). Direct, premium, zero fluff.
- Pricing if asked: Receptionist $295/mo, Reviews $395/mo, Voice $595/mo, Bundle $895/mo. Paid to start.
- English/Spanish OK.
- COMPLIANCE: The public vox.chat product is NOT HIPAA compliant and must not take medical, patient, or other regulated health information. If asked about HIPAA / PHI / healthcare: say we cannot handle protected health information on this stack; a dedicated environment is a custom contract, not a self-serve add-on. Do not quote HIPAA or ZDR monthly prices as if they are live on this website.

LEAD CAPTURE
When you have at least a phone AND (name OR business) AND clear interest, append EXACTLY one line at the very end:

<<<LEAD>>>{"name":"string","phone":"string","email":"string or empty","business":"string or empty","city":"string or empty","trade":"hvac|plumbing|electrical|other|unknown","interest":"voice|receptionist|reviews|bundle|audit|unknown","notes":"one-line summary"}<<<END>>>

Only emit once when complete enough. Do not invent phone numbers.`

function extractLead(raw) {
  const re = /<<<LEAD>>>\s*([\s\S]*?)\s*<<<END>>>/i
  const m = raw.match(re)
  if (!m) return { cleanReply: raw.trim(), lead: null }
  const cleanReply = raw.replace(re, '').trim()
  try {
    const parsed = JSON.parse(m[1].trim())
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

function modelName() {
  return process.env.XAI_MODEL || 'grok-3-mini'
}

export default async function handler(req, res) {
  try {
    setNoStore(res)
    if (handleOptions(req, res)) return
    if (!setCors(req, res)) return rejectCors(res)

    if (req.method === 'GET') {
      return res.status(200).json({
        ...healthPayload('receptionist'),
        online: Boolean(process.env.XAI_API_KEY),
      })
    }

    if (req.method !== 'POST') {
      return jsonError(res, 405, 'Method not allowed')
    }

    if (!browserOriginOk(req)) {
      return jsonError(res, 403, 'Forbidden')
    }

    const limited = await rateLimitIp(req, 'receptionist', 15, 10 * 60 * 1000)
    if (!limited.ok) {
      return jsonError(res, 429, 'Too many messages. Call or text (209) 996-7102 to talk now.', {
        code: 'rate_limit',
      })
    }

    const apiKey = process.env.XAI_API_KEY
    if (!apiKey) {
      return jsonError(res, 503, 'Receptionist is temporarily unavailable.', { fallback: true, code: 'offline' })
    }

    let raw
    try {
      raw = await readRawBody(req)
    } catch (e) {
      if (e.statusCode === 413) return jsonError(res, 413, 'Payload too large', { fallback: true })
      throw e
    }

    let body
    try {
      body = parseBody(req, raw).value || {}
    } catch {
      return jsonError(res, 400, 'Invalid request')
    }

    const messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return jsonError(res, 400, 'messages required')
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
      return jsonError(res, 400, 'messages required')
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
      logSafe('[receptionist] xAI error', { status: upstream.status, snippet: errText.slice(0, 80) })
      let code = 'upstream'
      if (upstream.status === 403) code = 'provider'
      else if (upstream.status === 401) code = 'provider'
      return jsonError(res, 502, 'Receptionist is temporarily unavailable.', {
        fallback: true,
        code,
      })
    }

    const data = await upstream.json()
    const rawReply = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
    const replyRaw = rawReply && String(rawReply).trim()
    if (!replyRaw) {
      return jsonError(res, 502, 'Receptionist is temporarily unavailable.', { fallback: true })
    }

    if (mode !== 'live') {
      return res.status(200).json({ reply: replyRaw })
    }

    const extracted = extractLead(replyRaw)
    let notified
    let lead = extracted.lead
    const visitorEmail = validEmail(body.visitorEmail)
    if (visitorEmail && (!lead || !lead.email)) {
      lead = Object.assign({}, lead || {}, { email: visitorEmail })
    }
    if (lead && (lead.phone || lead.email)) {
      lead.source = body.source || 'live-receptionist'
      const delivered = await deliverLead(lead)
      notified = delivered.channels
      logSafe('[receptionist] lead', { ok: delivered.ok, channels: notified })
    }

    return res.status(200).json({ reply: extracted.cleanReply, notified })
  } catch (e) {
    logSafe('[receptionist] uncaught', { err: e && e.message })
    return jsonError(res, 500, 'Server error', { fallback: true })
  }
}
