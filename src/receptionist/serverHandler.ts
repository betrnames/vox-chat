import { RECEPTIONIST_SYSTEM_PROMPT } from './prompt'
import { VOX_RECEPTIONIST_SYSTEM_PROMPT } from './voxPrompt'
import { extractLeadFromReply, notifyLead, type CapturedLead } from './notifyLead'

export type IncomingMessage = { role: 'user' | 'assistant'; content: string }

export type ReceptionistMode = 'demo' | 'live'

export type ReceptionistResult =
  | { reply: string; lead?: CapturedLead | null; notified?: string[] }
  | { error: string; fallback: true }

function systemFor(mode: ReceptionistMode): string {
  return mode === 'live' ? VOX_RECEPTIONIST_SYSTEM_PROMPT : RECEPTIONIST_SYSTEM_PROMPT
}

/** Shared SpaceXAI call used by Vite dev middleware and Vercel /api/receptionist. */
export async function runReceptionist(
  messages: IncomingMessage[],
  apiKey: string,
  options: { mode?: ReceptionistMode; source?: string } = {},
): Promise<ReceptionistResult> {
  const mode: ReceptionistMode = options.mode === 'live' ? 'live' : 'demo'

  const trimmed = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-16)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))

  if (trimmed.length === 0) {
    return { error: 'messages required', fallback: true }
  }

  try {
    const upstream = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-4.5',
        temperature: mode === 'live' ? 0.4 : 0.5,
        max_tokens: 450,
        messages: [{ role: 'system', content: systemFor(mode) }, ...trimmed],
      }),
    })

    if (!upstream.ok) {
      return { error: 'Upstream AI error', fallback: true }
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) {
      return { error: 'Empty AI response', fallback: true }
    }

    if (mode !== 'live') {
      return { reply: raw }
    }

    const { cleanReply, lead } = extractLeadFromReply(raw)
    let notified: string[] | undefined

    if (lead?.phone || lead?.email) {
      const result = await notifyLead({
        ...lead,
        source: options.source || 'live-receptionist',
      })
      notified = result.channels
    }

    return { reply: cleanReply, lead, notified }
  } catch {
    return { error: 'Server error', fallback: true }
  }
}
