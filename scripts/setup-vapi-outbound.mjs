/**
 * Create (or update) the Vox Outbound assistant for cold/warm outreach calls.
 *
 * Usage:
 *   node scripts/setup-vapi-outbound.mjs
 *
 * Env (from .env):
 *   VAPI_PRIVATE_KEY — Vapi Dashboard → Account → API Keys (Private)
 *
 * After running, save the printed VAPI_OUTBOUND_ASSISTANT_ID to .env.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadDotEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const API = 'https://api.vapi.ai';
const privateKey = (process.env.VAPI_PRIVATE_KEY || process.env.VAPI_API_KEY || '').trim();
const existingId = (process.env.VAPI_OUTBOUND_ASSISTANT_ID || '').trim();

if (!privateKey) {
  console.error('\n❌ Missing VAPI_PRIVATE_KEY in .env\n');
  process.exit(1);
}

const systemPrompt = fs.readFileSync(
  path.join(root, 'src', 'voice', 'vapi-outbound-prompt.txt'),
  'utf8'
);

async function vapi(method, pathname, body) {
  const res = await fetch(`${API}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const err = new Error(`Vapi ${method} ${pathname} → ${res.status}`);
    err.details = data;
    throw err;
  }
  return data;
}

const assistantBody = {
  name: 'Vox Outbound',
  firstMessage:
    "Hey, this is Vox calling from Vox.chat. I'm reaching out to local contractors in the Central Valley — we help businesses like yours make sure you never miss a call, even when you're on a job. Do you have a quick minute?",
  model: {
    provider: 'openai',
    model: 'gpt-4.1-mini',
    temperature: 0.7,
    maxTokens: 300,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
    ],
  },
  voice: {
    provider: 'vapi',
    voiceId: 'Nico',
  },
  serverUrl: 'https://vox.chat/api/voice-webhook',
  maxDurationSeconds: 180,
  silenceTimeoutSeconds: 15,
  endCallMessage: 'Thanks for your time. Have a good one.',
  backgroundDenoisingEnabled: true,
};

async function main() {
  console.log('Vox Outbound Assistant Setup\n');

  let assistant;

  if (existingId) {
    console.log(`Updating existing assistant: ${existingId}`);
    assistant = await vapi('PATCH', `/assistant/${existingId}`, assistantBody);
    console.log(`✅ Updated: ${assistant.name} (${assistant.id})`);
  } else {
    console.log('Creating new outbound assistant...');
    assistant = await vapi('POST', '/assistant', assistantBody);
    console.log(`✅ Created: ${assistant.name} (${assistant.id})`);
  }

  console.log(`
Add to .env:
  VAPI_OUTBOUND_ASSISTANT_ID=${assistant.id}

Dashboard:
  https://dashboard.vapi.ai/assistants/${assistant.id}
`);
}

main().catch((e) => {
  console.error('\n❌ Setup failed:', e.message);
  if (e.details) console.error(JSON.stringify(e.details, null, 2));
  process.exit(1);
});
