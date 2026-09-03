/**
 * POST /api/voice-luis-live — browser “live person” handoff
 * Vapi tool server: require VAPI_WEBHOOK_SECRET in production.
 */
import {
  clean,
  handleOptions,
  healthPayload,
  jsonError,
  logSafe,
  parseBody,
  rateLimitKey,
  readRawBody,
  setNoStore,
  verifyVapiWebhook,
} from './_lib/security.js'
import { normalizePhone, sendTwilioSms, twilioConfigured } from './reviewsShared.js'

const VAPI_API = 'https://api.vapi.ai'
const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID || ''
const LUIS_E164 = () =>
  normalizePhone(process.env.LUIS_PHONE_NUMBER || process.env.REVIEW_OWNER_PHONE || '')
const TRANSFER_TOOL_ID = process.env.VAPI_TRANSFER_TOOL_ID || ''

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
  const owner = LUIS_E164()
  if (!owner || !twilioConfigured()) {
    return { ok: false, error: 'sms_not_configured' }
  }
  const body = [
    'Vox LIVE request',
    name ? `Name: ${name}` : null,
    phone ? `Visitor phone: ${phone}` : null,
    reason ? `Why: ${reason}` : null,
    callId ? `WebCall: ${callId}` : null,
    '— visitor may get a callback from 209-502-3028 to connect you live',
  ]
    .filter(Boolean)
    .join(' · ')
  return sendTwilioSms(owner, body, { kind: 'owner_alert' })
}

async function callVisitorThenTransferToLuis({ name, phone, reason }) {
  const privateKey = (process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY || '').trim()
  const luis = LUIS_E164()
  const visitor = normalizePhone(phone)
  if (!privateKey || !luis || !visitor || !PHONE_NUMBER_ID) {
    return { ok: false, error: 'missing_config_or_visitor_phone' }
  }

  const who = name || 'there'
  const res = await fetch(`${VAPI_API}/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      phoneNumberId: PHONE_NUMBER_ID,
      customer: { number: visitor, name: name || undefined },
      assistant: {
        name: 'Vox bridge to Luis',
        firstMessage: `Hi ${who}, this is Vox calling you back from our agent line. Connecting you to Luis now — please stay on the line.`,
        model: {
          provider: 'openai',
          model: 'gpt-4.1-mini',
          messages: [
            {
              role: 'system',
              content: `You connect a website visitor to Luis Mariscal for a live call.
Immediately after your first message, call transferCall with destination ${luis}.
Do not ask questions. Do not chat. One short connecting line only.
Reason they wanted Luis: ${reason || 'live person'}.`,
            },
          ],
          toolIds: TRANSFER_TOOL_ID ? [TRANSFER_TOOL_ID] : [],
        },
        voice: { provider: 'vapi', voiceId: 'Nico' },
        maxDurationSeconds: 120,
        silenceTimeoutSeconds: 20,
      },
    }),
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    logSafe('[voice-luis-live] visitor outbound', { status: res.status })
    return { ok: false, error: 'outbound_failed', status: res.status }
  }
  return { ok: true, callId: data.id }
}

export default async function handler(req, res) {
  setNoStore(res)
  if (handleOptions(req, res)) return

  if (req.method === 'GET') {
    res.status(200).json(healthPayload('voice-luis-live'))
    return
  }

  if (req.method !== 'POST') {
    jsonError(res, 405, 'Method not allowed')
    return
  }

  try {
    const raw = await readRawBody(req)
    const auth = verifyVapiWebhook(req, raw)
    if (!auth.ok) {
      logSafe('[voice-luis-live] auth', { code: auth.code })
      jsonError(res, auth.status || 401, 'Unauthorized', { code: auth.code })
      return
    }

    const body = parseBody(req, raw).value || {}
    const message = unwrap(body)
    const type = message?.type || body?.type || ''

    if (type && type !== 'tool-calls' && type !== 'function-call' && type !== 'tool-calls-message') {
      if (!message?.toolCallList && !message?.toolCalls) {
        res.status(200).json({ ok: true, ignored: type })
        return
      }
    }

    const { toolCallId, args } = extractToolArgs(message)
    const name = clean(args.name || args.customerName || '', 80)
    const phone =
      normalizePhone(args.phone || args.callback || args.phoneNumber || '') ||
      clean(args.phone || '', 40)
    const reason = clean(args.reason || args.note || args.message || 'asked for live person', 200)
    const callId = clean(message?.call?.id || body?.call?.id || '', 80)

    // Rate-limit by visitor phone (or call), never by Vapi's shared egress IP.
    const limited = await rateLimitKey(
      `voice-luis-live:${phone || callId || 'unknown'}`,
      8,
      10 * 60 * 1000,
    )
    if (!limited.ok) {
      jsonError(res, 429, 'Too many requests')
      return
    }

    const sms = await smsLuis({ name, phone, reason, callId })
    const luis = LUIS_E164()
    const visitorIsLuis = Boolean(phone && luis && phone === luis)

    let bridge = { ok: false, error: 'no_visitor_phone' }
    if (phone && !visitorIsLuis) {
      bridge = await callVisitorThenTransferToLuis({ name, phone, reason })
    } else if (visitorIsLuis) {
      bridge = { ok: false, error: 'visitor_is_luis_phone' }
    }

    let messageOut
    if (bridge.ok) {
      messageOut =
        'SMS was sent to Luis. We are ALSO calling the visitor from 209-502-3028 to try a phone bridge. Tell them clearly: the website step is an SMS alert to Luis (not a live browser transfer). If their phone rings from the agent line, answer it. For a true live hold-and-transfer they can dial 209-502-3028 and ask for Luis.'
    } else if (!phone) {
      messageOut =
        'Need their callback phone first. Remind them: from the website this is an SMS to Luis for callback — not a live transfer. Ask for the best number for Luis to text/call back.'
    } else if (visitorIsLuis && sms.ok) {
      messageOut =
        'Luis was texted (SMS alert only — not a live transfer). Tell them that clearly. He will call back ASAP. For a live hold-and-transfer, dial 209-502-3028 from a different phone and ask for Luis.'
    } else if (sms.ok) {
      messageOut =
        'Luis was texted with their info (SMS alert — not a live transfer). Tell them that clearly and that he will call back ASAP. Suggest dialing 209-502-3028 from their phone for a real live transfer if they want that now.'
    } else {
      messageOut =
        'Could not reach Luis automatically. Collect name and phone for manual follow-up. Remind them website path is SMS callback, not live transfer. They can dial 209-502-3028 for the live phone agent line.'
    }

    const result = {
      ok: Boolean(sms.ok || bridge.ok),
      sms: sms.ok ? 'sent' : 'failed',
      liveBridge: bridge.ok ? 'calling_visitor_then_transfer' : 'failed',
      message: messageOut,
    }

    logSafe('[voice-luis-live]', {
      hasName: Boolean(name),
      hasPhone: Boolean(phone),
      sms: result.sms,
      liveBridge: result.liveBridge,
    })

    if (toolCallId) {
      res.status(200).json({
        results: [{ toolCallId, result: JSON.stringify(result) }],
      })
      return
    }

    res.status(200).json(result)
  } catch (e) {
    logSafe('[voice-luis-live]', { err: e && e.message })
    res.status(200).json({
      results: [
        {
          toolCallId: 'unknown',
          result: JSON.stringify({
            ok: false,
            message: 'Internal error. Collect callback number for manual follow-up.',
          }),
        },
      ],
    })
  }
}
