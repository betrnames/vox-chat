/**
 * Vercel serverless — GET /api/voice
 * Public status for Voice POC (no secrets, no key presence leak).
 */
import { handleOptions, healthPayload, jsonError, setNoStore } from './_lib/security.js'

function cleanPhone(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  const digits = s.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (s.startsWith('+') && digits.length >= 10) return `+${digits}`
  return ''
}

function formatDisplay(e164) {
  const d = e164.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
  }
  return e164
}

export default async function handler(req, res) {
  setNoStore(res)
  res.setHeader('Content-Type', 'application/json')
  if (handleOptions(req, res)) return

  if (req.method !== 'GET') {
    jsonError(res, 405, 'Method not allowed')
    return
  }

  const phone = cleanPhone(process.env.VAPI_PHONE_NUMBER || '')
  const configured = Boolean(phone)

  res.status(200).json({
    ...healthPayload('vox-voice'),
    online: configured,
    phone: phone || null,
    phoneDisplay: phone ? formatDisplay(phone) : null,
    telHref: phone ? `tel:${phone}` : null,
  })
}
