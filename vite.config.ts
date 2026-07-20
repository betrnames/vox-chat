import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import type { IncomingMessage, ServerResponse } from 'http'

const __dirname = dirname(fileURLToPath(import.meta.url))

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

/** Dev-only: mirror production rate limit (15 msgs / 10 min per IP) */
const DEV_RATE_LIMIT_MAX = 15
const DEV_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const devRateLimitHits = new Map<string, { count: number; resetAt: number }>()

function getDevClientIp(req: IncomingMessage): string {
  const xf = req.headers['x-forwarded-for'] || req.headers['x-real-ip']
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function checkDevRateLimit(ip: string): boolean {
  const now = Date.now()
  let entry = devRateLimitHits.get(ip)
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + DEV_RATE_LIMIT_WINDOW_MS }
    devRateLimitHits.set(ip, entry)
  }
  entry.count += 1
  return entry.count <= DEV_RATE_LIMIT_MAX
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, entry] of devRateLimitHits.entries()) {
    if (now >= entry.resetAt) devRateLimitHits.delete(ip)
  }
}, DEV_RATE_LIMIT_WINDOW_MS).unref?.()

function receptionistApiPlugin(apiKey: string | undefined): Plugin {
  return {
    name: 'receptionist-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url?.split('?')[0] || ''
        if (url !== '/api/receptionist' && url !== '/api/lead') {
          next()
          return
        }

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        try {
          const body = (await readJsonBody(req)) as Record<string, unknown>
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Cache-Control', 'no-store')

          if (url === '/api/lead') {
            const { notifyLead } = await server.ssrLoadModule('/src/receptionist/notifyLead.ts')
            const result = await notifyLead({
              ...(body as object),
              source: (body.source as string) || 'api-lead',
            })
            res.statusCode = result.ok ? 200 : 502
            res.end(JSON.stringify(result))
            return
          }

          if (!checkDevRateLimit(getDevClientIp(req))) {
            res.statusCode = 429
            res.end(
              JSON.stringify({
                error: 'Too many messages. Call or text (209) 996-7102 to talk now.',
                code: 'rate_limit',
              }),
            )
            return
          }

          if (!apiKey) {
            res.statusCode = 503
            res.end(JSON.stringify({ error: 'XAI_API_KEY not configured', fallback: true }))
            return
          }

          const { runReceptionist } = await server.ssrLoadModule('/src/receptionist/serverHandler.ts')
          const result = await runReceptionist(body.messages || [], apiKey, {
            mode: body.mode === 'live' ? 'live' : 'demo',
            source: body.source,
          })
          res.statusCode = 'error' in result ? 502 : 200
          res.end(JSON.stringify(result))
        } catch (e) {
          console.error('[receptionist-api]', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Server error', fallback: true }))
        }
      })
    },
  }
}

/** Dev-only: POST/GET /api/reviews — real Twilio SMS when env is set */
const DEV_REVIEW_LIMIT_MAX = 3
const DEV_REVIEW_WINDOW_MS = 10 * 60 * 1000
const devReviewHits = new Map<string, { count: number; resetAt: number }>()

function checkDevReviewLimit(ip: string): boolean {
  const now = Date.now()
  let entry = devReviewHits.get(ip)
  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + DEV_REVIEW_WINDOW_MS }
    devReviewHits.set(ip, entry)
  }
  entry.count += 1
  return entry.count <= DEV_REVIEW_LIMIT_MAX
}

function reviewsApiPlugin(): Plugin {
  return {
    name: 'reviews-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url?.split('?')[0] || ''
        if (url !== '/api/reviews' && url !== '/api/reviews-inbound') {
          next()
          return
        }

        res.setHeader('Cache-Control', 'no-store')

        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }

        try {
          // Load shared helpers from api/ (Node ESM)
          const shared = (await import(
            pathToFileURL(resolve(__dirname, 'api/reviewsShared.js')).href
          )) as {
            normalizePhone: (raw: unknown) => string
            pendingReviews: Map<string, { name: string; business: string; sentAt: number }>
            ratingAskBody: (name: string) => string
            reviewUrl: () => string
            sendTwilioSms: (
              to: string,
              body: string,
              options?: { kind?: string },
            ) => Promise<{ ok: boolean; error?: string; code?: number; trial?: boolean }>
            twilioConfigured: () => boolean
            clean: (s: unknown, max?: number) => string
            useTrialTemplates?: () => boolean
          }
          const {
            normalizePhone,
            pendingReviews,
            ratingAskBody,
            reviewUrl,
            sendTwilioSms,
            twilioConfigured,
            clean,
            useTrialTemplates,
          } = shared

          if (url === '/api/reviews' && req.method === 'GET') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                ok: true,
                online: twilioConfigured(),
                product: 'vox-reviews',
                trial: typeof useTrialTemplates === 'function' ? useTrialTemplates() : true,
              }),
            )
            return
          }

          if (url === '/api/reviews' && req.method === 'POST') {
            res.setHeader('Content-Type', 'application/json')
            if (!checkDevReviewLimit(getDevClientIp(req))) {
              res.statusCode = 429
              res.end(
                JSON.stringify({
                  error: 'Too many review texts from this connection. Try again in a few minutes.',
                  code: 'rate_limit',
                }),
              )
              return
            }
            if (!twilioConfigured()) {
              res.statusCode = 503
              res.end(
                JSON.stringify({
                  error: 'Reviews SMS not configured yet. Call (209) 996-7102 or email support@vox.chat.',
                  fallback: true,
                  code: 'twilio_missing',
                }),
              )
              return
            }
            const body = (await readJsonBody(req)) as Record<string, unknown>
            const phone = normalizePhone(body.phone)
            if (!phone) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Enter a valid US mobile number.' }))
              return
            }
            const name = clean(body.name, 80)
            const business = clean(body.business, 80)
            // Trial: Body must be template name (sms_feedback_surveys), not free text
            const result = await sendTwilioSms(phone, ratingAskBody(name), { kind: 'rating_ask' })
            if (!result.ok) {
              res.statusCode = 502
              res.end(
                JSON.stringify({
                  error: result.error || 'Could not send SMS',
                  code: result.code || 'twilio_error',
                  hint: 'Trial: verified numbers only. After upgrade set TWILIO_TRIAL=false for custom copy.',
                }),
              )
              return
            }
            pendingReviews.set(phone, { name, business, sentAt: Date.now() })
            res.statusCode = 200
            res.end(
              JSON.stringify({
                ok: true,
                phone,
                trial: result.trial,
                message: result.trial
                  ? 'Sent (trial template: feedback survey). Reply 1–5 to continue. Custom Vox copy unlocks after you upgrade Twilio.'
                  : 'Review request sent. Reply 1–5 on that text to continue the flow.',
              }),
            )
            return
          }

          if (url === '/api/reviews-inbound' && req.method === 'POST') {
            // For local Twilio webhook (ngrok). Form body.
            const chunks: Buffer[] = []
            await new Promise<void>((resolve, reject) => {
              req.on('data', (c) => chunks.push(c))
              req.on('end', () => resolve())
              req.on('error', reject)
            })
            const raw = Buffer.concat(chunks).toString('utf8')
            const params = new URLSearchParams(raw)
            const from = normalizePhone(params.get('From') || params.get('from') || '')
            const text = clean(params.get('Body') || params.get('body') || '', 320)
            const m = String(text).match(/\b([1-5])\b/)
            const rating = m ? Number(m[1]) : null

            let reply =
              'Thanks for texting Vox Reviews. Reply with a single number 1–5 to rate your service, or call (209) 996-7102.'

            if (from && rating != null) {
              const pending = pendingReviews.get(from)
              const name = pending?.name || ''
              const positive = rating >= 4
              if (positive) {
                const link = reviewUrl()
                reply = name
                  ? `Thanks ${name} — glad it went well. Mind a 30-second Google review? ${link}`
                  : `Thanks — glad it went well. Mind a 30-second Google review? ${link}`
                pendingReviews.delete(from)
              } else {
                reply =
                  "Sorry it wasn't a 5. We're not sending a public review link — the owner will reach out shortly."
                pendingReviews.delete(from)
              }
              // Trial: no free-form TwiML — send template via API
              if (typeof useTrialTemplates === 'function' ? useTrialTemplates() : true) {
                await sendTwilioSms(from, reply, { kind: positive ? 'positive' : 'negative' })
                res.statusCode = 200
                res.setHeader('Content-Type', 'text/xml')
                res.end('<?xml version="1.0" encoding="UTF-8"?><Response></Response>')
                return
              }
            }

            const escaped = reply
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
            res.statusCode = 200
            res.setHeader('Content-Type', 'text/xml')
            res.end(
              `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`,
            )
            return
          }

          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (e) {
          console.error('[reviews-api]', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Server error' }))
        }
      })
    },
  }
}

/** Dev: GET /api/voice + POST /api/voice-webhook */
function voiceApiPlugin(): Plugin {
  return {
    name: 'voice-api',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const url = req.url?.split('?')[0] || ''
        if (url !== '/api/voice' && url !== '/api/voice-webhook') {
          next()
          return
        }

        res.setHeader('Cache-Control', 'no-store')

        try {
          if (url === '/api/voice' && req.method === 'GET') {
            const phoneRaw = process.env.VAPI_PHONE_NUMBER || ''
            const digits = phoneRaw.replace(/\D/g, '')
            let phone = ''
            if (digits.length === 10) phone = `+1${digits}`
            else if (digits.length === 11 && digits.startsWith('1')) phone = `+${digits}`
            else if (phoneRaw.startsWith('+')) phone = phoneRaw.trim()
            const online = Boolean(phone)
            let phoneDisplay = phone
            if (digits.length === 11 && digits.startsWith('1')) {
              phoneDisplay = `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`
            }
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(
              JSON.stringify({
                ok: true,
                product: 'vox-voice',
                online,
                phone: phone || null,
                phoneDisplay: online ? phoneDisplay : null,
                telHref: online ? `tel:${phone}` : null,
              }),
            )
            return
          }

          if (url === '/api/voice-webhook' && req.method === 'POST') {
            // Dynamic import of production handler via path
            const mod = (await import(
              pathToFileURL(resolve(__dirname, 'api/voice-webhook.js')).href
            )) as { default: (req: IncomingMessage, res: ServerResponse) => Promise<void> }
            await mod.default(req, res)
            return
          }

          if (url === '/api/voice-webhook' && req.method === 'GET') {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true, webhook: 'voice-webhook' }))
            return
          }

          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
        } catch (e) {
          console.error('[voice-api]', e)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Server error' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.XAI_API_KEY || process.env.XAI_API_KEY

  // Surface Twilio + review + voice env into process for api handlers in dev
  for (const key of [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_FROM_NUMBER',
    'TWILIO_TRIAL',
    'GOOGLE_REVIEW_URL',
    'REVIEW_OWNER_PHONE',
    'FORMSPREE_ENDPOINT',
    'VAPI_PHONE_NUMBER',
    'VAPI_API_KEY',
    'VAPI_WEBHOOK_SECRET',
    'GOOGLE_SHEET_ID',
    'GOOGLE_SERVICE_ACCOUNT_JSON_BASE64',
  ]) {
    if (env[key] && !process.env[key]) process.env[key] = env[key]
  }

  return {
    plugins: [react(), tailwindcss(), receptionistApiPlugin(apiKey), reviewsApiPlugin(), voiceApiPlugin()],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          faq: resolve(__dirname, 'faq.html'),
          blog: resolve(__dirname, 'blog.html'),
          'blog-automation-roi': resolve(__dirname, 'blog/automation-roi.html'),
          'blog-missed-calls': resolve(__dirname, 'blog/missed-calls.html'),
          'blog-chatbots-vs-forms': resolve(__dirname, 'blog/chatbots-vs-forms.html'),
          'blog-google-reviews': resolve(__dirname, 'blog/google-reviews.html'),
          'blog-plumber-after-hours': resolve(__dirname, 'blog/plumber-after-hours.html'),
          'blog-electrician-leads': resolve(__dirname, 'blog/electrician-leads.html'),
          'blog-manteca-reviews': resolve(__dirname, 'blog/manteca-contractors-double-google-reviews.html'),
          'blog-turlock-missed-calls': resolve(__dirname, 'blog/turlock-missed-calls-costing-thousands.html'),
          'blog-ai-automation-guide': resolve(__dirname, 'blog/ai-automation-guide-central-valley-contractors.html'),
          legal: resolve(__dirname, 'legal.html'),
          // Unlisted intake — not linked from nav/footer/sitemap
          setup: resolve(__dirname, 'setup.html'),
        },
      },
    },
  }
})
