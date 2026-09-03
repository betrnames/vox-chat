/**
 * Vercel serverless — POST /api/lead
 * Browser lead capture (JSON or HTML form). Origin + rate limit + honeypot.
 */
import { deliverLead, hasContact, normalizeLead } from './_lib/leads.js'
import {
  browserOriginOk,
  handleOptions,
  honeypotTriggered,
  jsonError,
  logSafe,
  parseBody,
  rateLimitIp,
  readRawBody,
  rejectCors,
  safeRedirect,
  setCors,
  setNoStore,
} from './_lib/security.js'

export default async function handler(req, res) {
  try {
    setNoStore(res)
    if (handleOptions(req, res)) return
    if (!setCors(req, res)) return rejectCors(res)

    if (req.method !== 'POST') {
      return jsonError(res, 405, 'Method not allowed')
    }

    if (!browserOriginOk(req)) {
      return jsonError(res, 403, 'Forbidden')
    }

    const limited = await rateLimitIp(req, 'lead', 5, 10 * 60 * 1000)
    if (!limited.ok) {
      return jsonError(res, 429, 'Too many requests', { ok: false })
    }

    let raw
    try {
      raw = await readRawBody(req)
    } catch (e) {
      if (e.statusCode === 413) return jsonError(res, 413, 'Payload too large')
      throw e
    }

    const parsed = parseBody(req, raw)
    const body = parsed.value || {}

    if (honeypotTriggered(body)) {
      if (parsed.kind === 'form') {
        const loc = safeRedirect(body._next) || '/?thanks=1'
        res.setHeader('Location', loc)
        return res.status(303).end()
      }
      return res.status(200).json({ ok: true, channels: [] })
    }

    const lead = normalizeLead({
      ...body,
      source: body.source || (parsed.kind === 'form' ? 'web-form' : 'api-lead'),
      interest: body.interest || body.service,
      notes: body.notes || body.message,
    })

    if (!hasContact(lead)) {
      if (parsed.kind === 'form') {
        res.setHeader('Location', '/?error=contact')
        return res.status(303).end()
      }
      return jsonError(res, 400, 'phone or email required')
    }

    const result = await deliverLead(lead)
    logSafe('[lead]', { ok: result.ok, channels: result.channels, source: lead.source })

    if (parsed.kind === 'form') {
      const loc = safeRedirect(body._next) || (result.ok ? '/?thanks=1' : '/?error=lead')
      res.setHeader('Location', loc)
      return res.status(303).end()
    }

    return res.status(result.ok ? 200 : 502).json({ ok: result.ok, channels: result.channels })
  } catch (e) {
    logSafe('[lead]', { err: e && e.message })
    return jsonError(res, 500, 'Server error', { channels: [] })
  }
}
