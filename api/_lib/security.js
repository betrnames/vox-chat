/**
 * Shared security helpers for Vercel /api handlers.
 * Fail closed in production. Never log raw PII.
 */
import crypto from 'node:crypto'

export const MAX_BODY_BYTES = 64 * 1024

const DEFAULT_ORIGINS = [
  'https://vox.chat',
  'https://www.vox.chat',
]

function extraOrigins() {
  const raw = process.env.ALLOWED_ORIGINS || ''
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function allowedOrigins() {
  const list = [...DEFAULT_ORIGINS, ...extraOrigins()]
  if (!isProduction()) {
    list.push('http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173')
  }
  return [...new Set(list)]
}

export function isProduction() {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
}

export function getHeader(req, name) {
  const headers = req.headers || {}
  const lower = name.toLowerCase()
  const v = headers[lower] ?? headers[name]
  if (Array.isArray(v)) return String(v[0] || '')
  return v == null ? '' : String(v)
}

export function getClientIp(req) {
  const xf = getHeader(req, 'x-forwarded-for') || getHeader(req, 'x-real-ip') || getHeader(req, 'x-vercel-forwarded-for')
  if (xf) return xf.split(',')[0].trim().slice(0, 64)
  return (req.socket && req.socket.remoteAddress) || 'unknown'
}

export function requestOrigin(req) {
  return getHeader(req, 'origin') || ''
}

export function originAllowed(origin) {
  if (!origin) return false
  return allowedOrigins().includes(origin)
}

/** Browser endpoints: Origin or Referer must be allowlisted in production. */
export function browserOriginOk(req) {
  const origin = requestOrigin(req)
  if (origin) return originAllowed(origin)
  const referer = getHeader(req, 'referer')
  if (referer) {
    try {
      const u = new URL(referer)
      return originAllowed(`${u.protocol}//${u.host}`)
    } catch {
      /* ignore */
    }
  }
  return !isProduction()
}

export function setNoStore(res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('X-Content-Type-Options', 'nosniff')
}

/**
 * Reflect allowlisted Origin only. Never '*'.
 * @returns {boolean} false if a browser Origin was present and rejected
 */
export function setCors(req, res) {
  const origin = requestOrigin(req)
  if (!origin) {
    return true
  }
  if (!originAllowed(origin)) {
    return false
  }
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Max-Age', '600')
  return true
}

export function rejectCors(res) {
  setNoStore(res)
  res.status(403).json({ error: 'Forbidden', ok: false })
}

export function handleOptions(req, res) {
  setNoStore(res)
  if (!setCors(req, res)) {
    res.status(403).end()
    return true
  }
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

export function timingSafeEqualString(a, b) {
  const left = Buffer.from(String(a || ''), 'utf8')
  const right = Buffer.from(String(b || ''), 'utf8')
  if (left.length !== right.length) {
    crypto.timingSafeEqual(left.length ? left : Buffer.from('x'), left.length ? left : Buffer.from('x'))
    return false
  }
  if (!left.length) return false
  return crypto.timingSafeEqual(left, right)
}

export function redactPhone(value) {
  const digits = String(value || '').replace(/\D/g, '')
  if (digits.length < 7) return '[redacted]'
  return `***${digits.slice(-4)}`
}

export function redactEmail(value) {
  const s = String(value || '')
  const at = s.indexOf('@')
  if (at < 1) return '[redacted]'
  return `${s[0]}***${s.slice(at)}`
}

export function redactPii(value, depth = 0) {
  if (value == null) return value
  if (depth > 5) return '[truncated]'
  if (typeof value === 'string') {
    if (/@/.test(value) && /\./.test(value)) return redactEmail(value)
    const digits = value.replace(/\D/g, '')
    if (digits.length >= 10 && digits.length <= 15) return redactPhone(value)
    if (value.length > 180) return `${value.slice(0, 80)}…[truncated ${value.length} chars]`
    return value
  }
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redactPii(v, depth + 1))
  if (typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) {
      const key = k.toLowerCase()
      if (/(phone|mobile|cell|from|to|callback)/.test(key)) out[k] = redactPhone(v)
      else if (/(email|replyto|_replyto)/.test(key)) out[k] = redactEmail(v)
      else if (/(name|business|notes|transcript|message|content|body|artifact)/.test(key)) {
        out[k] = typeof v === 'string' ? `[${v.length} chars]` : redactPii(v, depth + 1)
      } else out[k] = redactPii(v, depth + 1)
    }
    return out
  }
  return value
}

export function logSafe(tag, payload) {
  try {
    console.error(tag, payload == null ? '' : redactPii(payload))
  } catch {
    console.error(tag, '[unserializable]')
  }
}

export function clean(s, max = 200) {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

export function validEmail(s) {
  const e = clean(s, 120).toLowerCase()
  if (!e || e.length > 120) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return ''
  if (/\.(ru|cn)$/i.test(e) && process.env.BLOCK_HIGH_RISK_TLDS === 'true') return ''
  return e
}

export function validUsPhone(s) {
  const digits = String(s || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (String(s || '').trim().startsWith('+') && digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`
  }
  return ''
}

/** Hidden field bots fill. Human users leave it empty. */
export function honeypotTriggered(body) {
  if (!body || typeof body !== 'object') return false
  const traps = [body.website, body.company_url, body._gotcha, body.fax]
  return traps.some((v) => typeof v === 'string' && v.trim().length > 0)
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function looksLikeEmail(s) {
  return EMAIL_RE.test(clean(s, 120))
}

export async function readRawBody(req, maxBytes = MAX_BODY_BYTES) {
  if (typeof req.body === 'string') {
    if (Buffer.byteLength(req.body, 'utf8') > maxBytes) {
      const err = new Error('payload_too_large')
      err.statusCode = 413
      throw err
    }
    return req.body
  }
  if (Buffer.isBuffer(req.body)) {
    if (req.body.length > maxBytes) {
      const err = new Error('payload_too_large')
      err.statusCode = 413
      throw err
    }
    return req.body.toString('utf8')
  }
  if (req.body && typeof req.body === 'object') {
    return null
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > maxBytes) {
      const err = new Error('payload_too_large')
      err.statusCode = 413
      throw err
    }
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export function parseBody(req, raw) {
  if (raw == null && req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return { kind: 'object', value: req.body }
  }
  const text = raw || ''
  const ct = getHeader(req, 'content-type').toLowerCase()
  if (ct.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(text)
    const value = {}
    for (const [k, v] of params.entries()) value[k] = v
    return { kind: 'form', value, params }
  }
  if (!text) return { kind: 'object', value: {} }
  try {
    return { kind: 'json', value: JSON.parse(text) }
  } catch {
    const err = new Error('invalid_json')
    err.statusCode = 400
    throw err
  }
}

export function publicUrl(req) {
  const proto = (getHeader(req, 'x-forwarded-proto') || 'https').split(',')[0].trim() || 'https'
  const host = (getHeader(req, 'x-forwarded-host') || getHeader(req, 'host')).split(',')[0].trim()
  const path = String(req.url || '').split('?')[0]
  return `${proto}://${host}${path}`
}

export function safeRedirect(next) {
  const s = clean(String(next || ''), 300)
  if (!s) return ''
  if (s.startsWith('/') && !s.startsWith('//') && !s.includes('\\')) return s
  try {
    const u = new URL(s)
    if (u.protocol === 'https:' && (u.hostname === 'vox.chat' || u.hostname === 'www.vox.chat')) {
      return u.toString()
    }
  } catch {
    /* ignore */
  }
  return ''
}

export function formspreeUrl() {
  const u = clean(process.env.FORMSPREE_ENDPOINT || '', 200)
  if (!u) return ''
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:') return ''
    if (parsed.hostname !== 'formspree.io') return ''
    if (!parsed.pathname.startsWith('/f/')) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

/** Apps Script / Google webhook only — blocks open SSRF if env is ever attacker-influenced. */
export function sheetWebhookUrl(raw) {
  const u = clean(raw || process.env.LEAD_SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL || '', 400)
  if (!u) return ''
  try {
    const parsed = new URL(u)
    if (parsed.protocol !== 'https:') return ''
    const host = parsed.hostname.toLowerCase()
    const ok =
      host === 'script.google.com' ||
      host.endsWith('.script.google.com') ||
      host === 'script.googleusercontent.com' ||
      host.endsWith('.googleusercontent.com')
    if (!ok) return ''
    return parsed.toString()
  } catch {
    return ''
  }
}

const memHits = globalThis.__voxRateLimit || new Map()
globalThis.__voxRateLimit = memHits

async function upstashIncr(key, windowSec) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  try {
    const res = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(windowSec), 'NX'],
      ]),
    })
    if (!res.ok) return null
    const data = await res.json()
    const count = Number(data?.[0]?.result)
    if (!Number.isFinite(count)) return null
    return count
  } catch {
    return null
  }
}

function memoryIncr(key, windowMs) {
  const now = Date.now()
  let entry = memHits.get(key)
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs }
    memHits.set(key, entry)
  }
  entry.count += 1
  if (memHits.size > 5000) {
    for (const [k, v] of memHits) {
      if (now >= v.resetAt) memHits.delete(k)
    }
  }
  return entry.count
}

/**
 * Durable when Upstash is configured; otherwise process-local (warm instances only).
 * @returns {Promise<{ ok: boolean, count: number }>}
 */
export async function rateLimit(key, max, windowMs) {
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
  const redisKey = `rl:${key}`
  const remote = await upstashIncr(redisKey, windowSec)
  if (remote != null) return { ok: remote <= max, count: remote }
  const count = memoryIncr(redisKey, windowMs)
  return { ok: count <= max, count }
}

export async function rateLimitIp(req, bucket, max, windowMs) {
  const ip = getClientIp(req)
  return rateLimit(`${bucket}:${ip}`, max, windowMs)
}

export async function rateLimitKey(key, max, windowMs) {
  return rateLimit(key, max, windowMs)
}

/**
 * Vapi tool/server URLs: require shared secret in production.
 * Accepts x-vapi-secret, x-webhook-secret, Authorization Bearer, or HMAC-SHA256(body).
 */
export function verifyVapiWebhook(req, rawBody) {
  const secret = process.env.VAPI_WEBHOOK_SECRET || ''
  const required = isProduction() || process.env.REQUIRE_WEBHOOK_AUTH === 'true'

  if (!secret) {
    if (required) return { ok: false, status: 503, code: 'webhook_unconfigured' }
    return { ok: true, insecure: true }
  }

  const headerSecret =
    getHeader(req, 'x-vapi-secret') ||
    getHeader(req, 'x-webhook-secret') ||
    getHeader(req, 'x-vapi-signature-secret')

  if (headerSecret && timingSafeEqualString(headerSecret, secret)) {
    return { ok: true }
  }

  const auth = getHeader(req, 'authorization')
  if (auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim()
    if (timingSafeEqualString(token, secret)) return { ok: true }
  }

  const sig =
    getHeader(req, 'x-vapi-signature') ||
    getHeader(req, 'x-hmac-signature') ||
    getHeader(req, 'x-signature')
  if (sig && rawBody != null) {
    const raw = typeof rawBody === 'string' ? rawBody : JSON.stringify(req.body || {})
    const digest = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    const given = sig.replace(/^sha256=/i, '').trim()
    if (timingSafeEqualString(digest, given)) return { ok: true }
    const digestB64 = crypto.createHmac('sha256', secret).update(raw).digest('base64')
    if (timingSafeEqualString(digestB64, given)) return { ok: true }
  }

  return { ok: false, status: 401, code: 'unauthorized' }
}

/** Twilio request validation (POST form fields). */
export function verifyTwilioSignature(req, fields) {
  const token = process.env.TWILIO_AUTH_TOKEN || ''
  const required = isProduction() || process.env.REQUIRE_TWILIO_SIGNATURE === 'true'
  if (!token) {
    if (required) return { ok: false, status: 503, code: 'twilio_unconfigured' }
    return { ok: true, insecure: true }
  }
  const given = getHeader(req, 'x-twilio-signature')
  if (!given) return { ok: false, status: 401, code: 'unauthorized' }

  const url = publicUrl(req)
  const params = fields && typeof fields === 'object' ? fields : {}
  const data = Object.keys(params)
    .sort()
    .reduce((acc, key) => acc + key + String(params[key] ?? ''), url)
  const expected = crypto.createHmac('sha1', token).update(Buffer.from(data, 'utf8')).digest('base64')
  if (!timingSafeEqualString(expected, given)) {
    return { ok: false, status: 401, code: 'unauthorized' }
  }
  return { ok: true }
}

export function jsonError(res, status, publicMessage, extra = {}) {
  setNoStore(res)
  res.status(status).json({ ok: false, error: publicMessage, ...extra })
}

export function healthPayload(service) {
  return { ok: true, service }
}
