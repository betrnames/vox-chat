/**
 * Attach flagEmergency + bookJob to a Vapi assistant.
 * Does not replace the system prompt. Paste templates/voice-prompt.md
 * (or the client voice-prompt) yourself so the agent knows when to call them.
 *
 *   VAPI_PRIVATE_KEY=sk_... VAPI_ASSISTANT_ID=... node scripts/setup-vapi-dispatch-tools.mjs
 *
 * Optional: VAPI_DISPATCH_URL (default https://vox.chat/api/voice-dispatch)
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadDotEnv() {
  const envPath = path.join(root, '.env')
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = val
  }
}

loadDotEnv()

const API = 'https://api.vapi.ai'
const privateKey = (process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY || '').trim()
const assistantId = (process.env.VAPI_ASSISTANT_ID || process.env.VITE_VAPI_ASSISTANT_ID || '').trim()
const serverUrl = (process.env.VAPI_DISPATCH_URL || 'https://vox.chat/api/voice-dispatch').trim()

function fail(msg) {
  console.error(`\n${msg}\n`)
  process.exit(1)
}

if (!privateKey) fail('Missing VAPI_PRIVATE_KEY')
if (!assistantId) fail('Missing VAPI_ASSISTANT_ID or VITE_VAPI_ASSISTANT_ID')

const TOOLS = [
  {
    name: 'flagEmergency',
    description:
      'Alert the owner immediately about an emergency service call (gas, fire, flood, sewage, sparks, or the caller says it is an emergency). Use instead of booking a normal appointment.',
    start: 'I am alerting the owner now.',
    properties: {
      name: { type: 'string' },
      phone: { type: 'string', description: 'Callback number' },
      address: { type: 'string' },
      issue: { type: 'string' },
    },
    required: ['phone', 'issue'],
  },
  {
    name: 'bookJob',
    description:
      'Book a non-emergency service job onto the shop Google Calendar after you have name, phone, address, issue, and a requested day and time. If the time is taken, offer only the returned suggestions.',
    start: 'Let me check the schedule.',
    properties: {
      name: { type: 'string' },
      phone: { type: 'string' },
      address: { type: 'string' },
      issue: { type: 'string' },
      start: { type: 'string', description: 'Requested time, like "tomorrow 2pm" or "Friday 10am"' },
    },
    required: ['phone', 'address', 'issue', 'start'],
  },
]

function toolBody(spec) {
  return {
    type: 'function',
    function: {
      name: spec.name,
      description: spec.description,
      parameters: {
        type: 'object',
        properties: spec.properties,
        required: spec.required,
      },
    },
    server: { url: serverUrl },
    messages: [
      { type: 'request-start', content: spec.start },
      {
        type: 'request-failed',
        content: 'I could not reach the schedule. I will have the owner confirm.',
      },
    ],
  }
}

async function vapi(method, pathname, body) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!res.ok) {
    const err = new Error(`Vapi ${method} ${pathname} → ${res.status}`)
    err.details = data
    throw err
  }
  return data
}

async function main() {
  console.log('Attaching dispatch tools')
  console.log('  assistant', assistantId)
  console.log('  server', serverUrl)

  const existing = await vapi('GET', `/assistant/${assistantId}`)
  const allTools = await vapi('GET', '/tool')
  const toolList = Array.isArray(allTools) ? allTools : []
  const byName = new Map()
  for (const t of toolList) {
    const n = t.function?.name || t.name
    if (n) byName.set(n, t)
  }

  const ids = []
  for (const spec of TOOLS) {
    const found = byName.get(spec.name)
    if (found?.id) {
      await vapi('PATCH', `/tool/${found.id}`, toolBody(spec))
      console.log(`  updated ${spec.name} ${found.id}`)
      ids.push(found.id)
    } else {
      const created = await vapi('POST', '/tool', toolBody(spec))
      console.log(`  created ${spec.name} ${created.id}`)
      ids.push(created.id)
    }
  }

  const prev = Array.isArray(existing.model?.toolIds) ? existing.model.toolIds : []
  const toolIds = [...new Set([...prev, ...ids])]
  const model = { ...(existing.model || {}), toolIds }
  await vapi('PATCH', `/assistant/${assistantId}`, {
    model: {
      provider: model.provider,
      model: model.model,
      temperature: model.temperature,
      maxTokens: model.maxTokens,
      messages: model.messages,
      toolIds,
      ...(Array.isArray(model.tools) ? { tools: model.tools } : {}),
    },
  })
  console.log('Assistant updated. Prompt was left as-is.')
  console.log('Paste the client voice prompt if this assistant should book jobs and flag emergencies.')
}

main().catch((e) => {
  console.error(e.message)
  if (e.details) console.error(JSON.stringify(e.details, null, 2))
  process.exit(1)
})
