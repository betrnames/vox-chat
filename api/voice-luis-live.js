/**
 * Vercel serverless — POST /api/voice-luis-live
 * Custom Vapi tool: notify Luis for live handoff from website web calls.
 *
 * Why: transferCall from a browser (webCall) often fails with
 * call.in-progress.error-transfer-failed — there is no PSTN leg to forward.
 * This endpoint:
 *  1) SMS Luis (Twilio — same stack as review owner alerts)
 *  2) Places an outbound Vapi phone call FROM the free Vapi number TO Luis
 *     so his phone actually rings with a short spoken summary
 *
 * TransferCall to Luis’s cell is still correct for true phone→phone transfers
 * (caller dials the free Vapi number first).
 */
import { normalizePhone, sendTwilioSms, twilioConfigured } from './reviewsShared.js'

const VAPI_API = 'https://api.vapi.ai'
const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID || '73b67fb1-249b-43c1-b6cd-a547c08093e3'

function clean(s, max = 200) {
  if (typeof s !== 'string') return ''
  return s.trim().slice(0, max)
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  const chunks = []
  for await (const c of req) chunks.push(c)
  const raw = Buffer.concat(chunks).toString('utf8')
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function unwrap(body) {
  if (!body || typeof body !== 'object') return body
  return body.message && typeof body.message === 'object' ? body.message : body
}

function extractToolArgs(message) {
  const list =
    message?.toolCallList ||
    message?.toolWithToolCallList?.map((t) => t.toolCall).filter(Boolean) ||
    message?.toolCalls ||
    []
  const first = Array.isArray(list) ? list[0] : null
  if (!first) return { toolCallId: '', args: {} }

  const toolCallId = first.id || first.toolCallId || ''
  let args = first.function?.arguments ?? first.arguments ?? first.parameters ?? {}
  if (typeof args === 'string') {
    try {
      args = JSON.parse(args)
    } catch {
      args = {}
    }
  }
  return { toolCallId, args: args && typeof args === 'object' ? args : {} }
}

async function smsLuis({ name, phone, reason, callId }) {
  const owner = normalizePhone(
    process.env.LUIS_PHONE_NUMBER || process.env.REVIEW_OWNER_PHONE || '',
  )
  if (!owner || !twilioConfigured()) {
    return { ok: false, error: 'sms_not_configured' }
  }
  const body = [
    'Vox LIVE request',
    name ? `Name: ${name}` : null,
    phone ? `Callback: ${phone}` : null,
    reason ? `Why: ${reason}` : null,
    callId ? `Call: ${callId}` : null,
    '— answer if ringing or call them back ASAP',
  ]
    .filter(Boolean)
    .join(' · ')
  return sendTwilioSms(owner, body, { kind: 'owner_alert' })
}

/**
 * Ring Luis via outbound phone call from free Vapi number.
 * Uses a short transient assistant so Luis hears context, then ends.
 */
async function ringLuisViaVapi({ name, phone, reason }) {
  const privateKey = (process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY || '').trim()
  const luis = normalizePhone(
    process.env.LUIS_PHONE_NUMBER || process.env.REVIEW_OWNER_PHONE || '',
  )
  if (!privateKey || !luis || !PHONE_NUMBER_ID) {
    return { ok: false, error: 'vapi_outbound_not_configured' }
  }

  const who = name || 'A website visitor'
  const cb = phone ? ` Their callback number is ${phone.split('').join(' ')}.` : ''
  const why = reason ? ` They said: ${reason}.` : ''
  const firstMessage = `Hi Luis, this is Vox from the website. ${who} asked to speak with you live.${cb}${why} Please call them back when you can. Goodbye.`

  const res = await fetch(`${VAPI_API}/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumberId: PHONE_NUMBER_ID,
      customer: { number: luis },
      assistant: {
        name: 'Vox → Luis live ping',
        firstMessage,
        endCallMessage: ' ',
        model: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content:
                'You only deliver the first message to Luis about a website visitor, then end the call. Do not take questions. Keep under 3 sentences.',
            },
          ],
        },
        voice: { provider: 'vapi', voiceId: 'Nico' },
        maxDurationSeconds: 45,
        silenceTimeoutSeconds: 10,
      },
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    console.error('[voice-luis-live] outbound', res.status, data)
    return { ok: false, error: 'outbound_failed', status: res.status, data }
  }
  return { ok: true, callId: data.id }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      ok: true,
      webhook: 'voice-luis-live',
      purpose: 'Notify Luis for live handoff from web voice',
    })
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = await readBody(req)
    const message = unwrap(body)
    const type = message?.type || body?.type || ''

    // Only act on tool-calls; ack the rest
    if (type && type !== 'tool-calls' && type !== 'function-call' && type !== 'tool-calls-message') {
      // Some payloads nest differently — still try extract
      if (!message?.toolCallList && !message?.toolCalls) {
        res.status(200).json({ ok: true, ignored: type })
        return
      }
    }

    const { toolCallId, args } = extractToolArgs(message)
    const name = clean(args.name || args.customerName || '', 80)
    const phone = normalizePhone(args.phone || args.callback || args.phoneNumber || '') || clean(args.phone || '', 40)
    const reason = clean(args.reason || args.note || args.message || 'asked for live person', 200)
    const callId = clean(message?.call?.id || body?.call?.id || '', 80)

    const [sms, ring] = await Promise.all([
      smsLuis({ name, phone, reason, callId }),
      ringLuisViaVapi({ name, phone, reason }),
    ])

    const result = {
      ok: Boolean(sms.ok || ring.ok),
      sms: sms.ok ? 'sent' : sms.error || 'failed',
      ring: ring.ok ? 'dialed' : ring.error || 'failed',
      message: ring.ok
        ? 'Luis is being called on his phone now. Ask the visitor to stay available for a callback if he misses it.'
        : sms.ok
          ? 'Luis was texted. Collect a callback number if missing and tell the visitor he will reach out shortly.'
          : 'Could not reach Luis automatically. Collect name and callback number for manual follow-up.',
    }

    console.log('[voice-luis-live]', { name, phone: phone ? 'yes' : 'no', sms: result.sms, ring: result.ring })

    // Vapi tool result shape
    if (toolCallId) {
      res.status(200).json({
        results: [
          {
            toolCallId,
            result: JSON.stringify(result),
          },
        ],
      })
      return
    }

    res.status(200).json(result)
  } catch (e) {
    console.error('[voice-luis-live]', e)
    res.status(200).json({
      results: [
        {
          toolCallId: 'unknown',
          result: JSON.stringify({
            ok: false,
            message: 'Internal error notifying Luis. Collect callback number instead.',
          }),
        },
      ],
    })
  }
}
