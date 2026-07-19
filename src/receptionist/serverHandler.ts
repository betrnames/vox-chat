import { RECEPTIONIST_SYSTEM_PROMPT } from './prompt'

export type IncomingMessage = { role: 'user' | 'assistant'; content: string }

/** Shared SpaceXAI call used by Vite dev middleware and optionally other runtimes. */
export async function runReceptionist(
  messages: IncomingMessage[],
  apiKey: string,
): Promise<{ reply: string } | { error: string; fallback: true }> {
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
        temperature: 0.5,
        max_tokens: 400,
        messages: [
          { role: 'system', content: RECEPTIONIST_SYSTEM_PROMPT },
          ...trimmed,
        ],
      }),
    })

    if (!upstream.ok) {
      return { error: 'Upstream AI error', fallback: true }
    }

    const data = (await upstream.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const reply = data.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      return { error: 'Empty AI response', fallback: true }
    }

    return { reply }
  } catch {
    return { error: 'Server error', fallback: true }
  }
}
