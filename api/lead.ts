import { notifyLead, type CapturedLead } from '../src/receptionist/notifyLead'

/**
 * Optional direct lead POST (widget fallback / testing).
 * Prefer automatic capture via /api/receptionist mode=live.
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

  const body = (typeof req.body === 'string' ? JSON.parse(req.body as string) : req.body) as CapturedLead
  if (!body?.phone && !body?.email) {
    return res.status(400).json({ error: 'phone or email required' })
  }

  const result = await notifyLead({
    ...body,
    source: body.source || 'api-lead',
  })

  return res.status(result.ok ? 200 : 502).json(result)
}
