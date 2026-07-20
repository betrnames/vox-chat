/**
 * Vercel serverless — GET /api/voice
 * Public status for Voice POC (no secrets).
 *
 * Env:
 *   VAPI_PHONE_NUMBER  — E.164 shown on site when set
 *   VAPI_API_KEY       — optional; presence means "configured"
 */
function cleanPhone(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  const digits = s.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (s.startsWith('+') && digits.length >= 10) return `+${digits}`
  return s
}

function formatDisplay(e164) {
  const d = e164.replace(/\D/g, '')
  if (d.length === 11 && d.startsWith('1')) {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`
  }
  return e164
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const phone = cleanPhone(process.env.VAPI_PHONE_NUMBER || '')
  const configured = Boolean(phone)

  res.status(200).json({
    ok: true,
    product: 'vox-voice',
    online: configured,
    phone: phone || null,
    phoneDisplay: phone ? formatDisplay(phone) : null,
    telHref: phone ? `tel:${phone}` : null,
    message: configured
      ? 'Live AI phone agent available — call the number shown.'
      : 'Voice agent not configured yet. Animated demo only.',
  })
}
