/**
 * Lead fan-out: Formspree (env-only) + Google Sheet + optional owner SMS.
 * Never logs raw PII. Never hardcodes third-party form IDs.
 */
import { writeLeadToSheet } from '../googleSheet.js'
import { normalizePhone, sendTwilioSms, twilioConfigured } from '../reviewsShared.js'
import { clean, formspreeUrl, logSafe, validEmail, validUsPhone } from './security.js'

export function normalizeLead(input) {
  const body = input && typeof input === 'object' ? input : {}
  const interest = clean(body.interest || body.service, 40)
  const phone = validUsPhone(body.phone) || clean(body.phone, 40)
  const email = validEmail(body.email) || (typeof body.email === 'string' ? clean(body.email, 120) : '')
  return {
    name: clean(body.name, 120) || 'Unknown',
    phone,
    email,
    business: clean(body.business, 120),
    city: clean(body.city, 80),
    trade: clean(body.trade, 40),
    interest,
    notes: clean(body.notes || body.message, 500),
    source: clean(body.source, 80) || 'api-lead',
    site: 'vox.chat',
    _subject:
      'Vox.chat lead: ' +
      (interest || 'Lead') +
      ' - ' +
      (clean(body.name) || phone || email || 'new'),
    _replyto: email || 'email@vox.chat',
    _format: 'plain',
    timestamp: new Date().toISOString(),
  }
}

export function hasContact(lead) {
  return Boolean(lead && (lead.phone || lead.email))
}

export async function deliverLead(lead, options = {}) {
  const channels = []
  const payload = normalizeLead(lead)
  if (!hasContact(payload) && options.requireContact !== false) {
    return { ok: false, channels, payload }
  }

  const formspree = formspreeUrl()
  if (formspree) {
    try {
      const r = await fetch(formspree, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      if (r.ok) channels.push('email')
      else logSafe('[lead] formspree', { status: r.status })
    } catch (e) {
      logSafe('[lead] formspree', { err: e && e.message })
    }
  }

  try {
    const sheetChannel = await writeLeadToSheet(payload)
    if (sheetChannel) channels.push(sheetChannel)
  } catch (e) {
    logSafe('[lead] sheet', { err: e && e.message })
  }

  const ownerPhone = normalizePhone(process.env.REVIEW_OWNER_PHONE)
  if (options.sms !== false && twilioConfigured() && ownerPhone) {
    try {
      const kind = options.smsKind || 'owner_alert'
      const smsBody =
        options.smsBody ||
        `New Vox.chat lead: ${payload.name} · ${payload.phone || payload.email}. Interest: ${payload.interest || 'unknown'}.`
      const smsResult = await sendTwilioSms(ownerPhone, smsBody, { kind })
      if (smsResult.ok) channels.push('sms')
      else logSafe('[lead] sms', { err: smsResult.error, code: smsResult.code })
    } catch (e) {
      logSafe('[lead] sms', { err: e && e.message })
    }
  }

  return { ok: channels.length > 0, channels, payload }
}
