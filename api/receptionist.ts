import { runReceptionist, type IncomingMessage, type ReceptionistMode } from '../src/receptionist/serverHandler'

/**
 * Vercel serverless: POST /api/receptionist
 * Body: { messages, mode?: 'live' | 'demo', source?: string }
 * SpaceXAI (xAI) — set XAI_API_KEY in Vercel env.
 */
export default async function handler(
  req: { method?: string; body?: unknown },
  res: {
    status: (code: number) => { json: (body: unknown) => void }
    setHeader: (k: string, v: string) => void
  },
) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.XAI_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'XAI_API_KEY not configured', fallback: true })
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body as string) : req.body) as {
    messages?: IncomingMessage[]
    mode?: ReceptionistMode
    source?: string
  }

  const messages = body?.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages required' })
  }

  const result = await runReceptionist(messages, apiKey, {
    mode: body.mode === 'live' ? 'live' : 'demo',
    source: body.source,
  })
  if ('error' in result) {
    return res.status(502).json(result)
  }
  return res.status(200).json(result)
}
