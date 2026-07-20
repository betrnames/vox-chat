import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.XAI_API_KEY || process.env.XAI_API_KEY

  return {
    plugins: [react(), tailwindcss(), receptionistApiPlugin(apiKey)],
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
