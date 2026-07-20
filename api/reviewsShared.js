/**
 * Shared Reviews POC helpers (send SMS, phone normalize, pending map).
 * Used by /api/reviews and /api/reviews-inbound.
 *
 * Twilio free trial: Body must be a predefined template name, not free text.
 * @see https://www.twilio.com/docs/usage/trials/try-out-sms
 */

/** @type {Map<string, { name: string, business: string, sentAt: number }>} */
export const pendingReviews = globalThis.__voxPendingReviews || new Map()
globalThis.__voxPendingReviews = pendingReviews

/** Trial-allowed Body values (API sends template name, not message text) */
export const TRIAL_TEMPLATES = {
  rating_ask: 'sms_feedback_surveys',
  positive: 'sms_customer_support',
  negative: 'sms_account_alerts',
  owner_alert: 'sms_internal_alerts',
  appointment: 'sms_appointment_reminders',
  order: 'sms_order_confirmation',
  delivery: 'sms_delivery_updates',
  marketing: 'sms_marketing_promotions',
  event: 'sms_event_notifications',
  twofa: 'sms_2fa',
}

export function clean(s, max = 120) {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

/** Normalize to E.164-ish US when possible */
export function normalizePhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (String(raw || '').trim().startsWith('+') && digits.length >= 10) return `+${digits}`
  return ''
}

export function twilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_FROM_NUMBER,
  )
}

/** Trial accounts cannot send free-form Body — only template names. */
export function useTrialTemplates() {
  const v = (process.env.TWILIO_TRIAL || '').toLowerCase()
  if (v === '0' || v === 'false' || v === 'no') return false
  if (v === '1' || v === 'true' || v === 'yes') return true
  // Default true so local POC works without extra config; set TWILIO_TRIAL=false after upgrade
  return true
}

/**
 * @param {string} to E.164
 * @param {string} body Free-form text (paid accounts only)
 * @param {{ kind?: keyof typeof TRIAL_TEMPLATES }} [options]
 */
export async function sendTwilioSms(to, body, options = {}) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) {
    return { ok: false, error: 'Twilio not configured' }
  }

  const params = { To: to, From: from }

  if (useTrialTemplates()) {
    const kind = options.kind || 'rating_ask'
    const envOverride =
      kind === 'rating_ask'
        ? process.env.TWILIO_TEMPLATE_RATING
        : kind === 'positive'
          ? process.env.TWILIO_TEMPLATE_POSITIVE
          : kind === 'negative'
            ? process.env.TWILIO_TEMPLATE_NEGATIVE
            : kind === 'owner_alert'
              ? process.env.TWILIO_TEMPLATE_OWNER
              : ''
    params.Body = envOverride || TRIAL_TEMPLATES[kind] || TRIAL_TEMPLATES.rating_ask
  } else {
    params.Body = body
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`
  const auth = Buffer.from(`${sid}:${token}`).toString('base64')
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  })

  const text = await res.text()
  let data = {}
  try {
    data = JSON.parse(text)
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    console.error('[reviews] twilio error', res.status, text.slice(0, 400))
    const msg = data.message || data.error_message || `Twilio ${res.status}`
    // Helpful hint when someone forgot trial mode with free-form body
    const hint =
      /template/i.test(msg) || data.code === 21656
        ? ' Trial accounts need TWILIO_TRIAL=true and predefined template names (sms_feedback_surveys, etc.).'
        : ''
    return {
      ok: false,
      error: msg + hint,
      code: data.code,
    }
  }
  return { ok: true, sid: data.sid, trial: useTrialTemplates(), template: params.Body }
}

export function ratingAskBody(name) {
  const who = name ? ` ${name}` : ''
  return `Hi${who}! How was your service with Valley Air Pros today? Reply with a number 1–5. — Vox Reviews`
}

export function reviewUrl() {
  return process.env.GOOGLE_REVIEW_URL || 'https://vox.chat'
}

export function positiveFollowUpBody(name) {
  const link = reviewUrl()
  const who = name ? ` ${name}` : ''
  return `Thanks${who} — glad it went well. Mind a 30-second Google review? ${link}`
}

export function negativeFollowUpBody() {
  return "Sorry it wasn't a 5. We're not sending a public review link — the owner will reach out shortly."
}
