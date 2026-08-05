/**
 * Wire Vox Voice assistant for live transfer to Luis.
 *
 * Creates/updates a transferCall tool → Luis's phone, then PATCHes the
 * existing Vapi assistant with the system prompt + tool.
 *
 * Required env (from .env or shell — never commit secrets):
 *   VAPI_PRIVATE_KEY       — Vapi Dashboard → Account → API Keys (Private)
 *   VITE_VAPI_ASSISTANT_ID or VAPI_ASSISTANT_ID
 *   LUIS_PHONE_NUMBER      — E.164, e.g. +12095551234 (Luis / transfer destination)
 *
 * Optional:
 *   VAPI_TRANSFER_MODE     — warm-transfer-wait-for-operator-to-speak-first-and-then-say-message | blind-transfer
 *   VAPI_SERVER_URL        — e.g. https://vox.chat/api/voice-webhook
 *
 * Usage:
 *   node scripts/setup-vapi-luis-transfer.mjs
 *   # or with inline env (PowerShell):
 *   $env:VAPI_PRIVATE_KEY='...'; $env:LUIS_PHONE_NUMBER='+1...'; node scripts/setup-vapi-luis-transfer.mjs
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
const assistantId = (
  process.env.VAPI_ASSISTANT_ID ||
  process.env.VITE_VAPI_ASSISTANT_ID ||
  ''
).trim();
const luisPhone = (process.env.LUIS_PHONE_NUMBER || process.env.REVIEW_OWNER_PHONE || '').trim();
const serverUrl = (process.env.VAPI_SERVER_URL || 'https://vox.chat/api/voice-webhook').trim();
const transferMode = (
  process.env.VAPI_TRANSFER_MODE || 'warm-transfer-wait-for-operator-to-speak-first-and-then-say-message'
).trim();

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!privateKey) {
  fail(
    'Missing VAPI_PRIVATE_KEY.\n' +
      '  Dashboard → https://dashboard.vapi.ai → Account / API Keys → create Private key.\n' +
      '  Then: $env:VAPI_PRIVATE_KEY="sk_..." ; node scripts/setup-vapi-luis-transfer.mjs'
  );
}
if (!assistantId) {
  fail('Missing VITE_VAPI_ASSISTANT_ID (or VAPI_ASSISTANT_ID) in .env');
}
if (!luisPhone || !/^\+[1-9]\d{7,14}$/.test(luisPhone)) {
  fail(
    'Missing or invalid LUIS_PHONE_NUMBER (E.164 required, e.g. +12095551234).\n' +
      '  This is the number that rings Luis when the caller asks for a live person.'
  );
}

const systemPrompt = fs.readFileSync(
  path.join(root, 'src', 'voice', 'vapi-system-prompt.txt'),
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

function maskPhone(p) {
  if (p.length < 6) return '***';
  return p.slice(0, 3) + '***' + p.slice(-4);
}

async function main() {
  console.log('Vox → Luis live transfer setup');
  console.log(`  Assistant: ${assistantId}`);
  console.log(`  Luis phone: ${maskPhone(luisPhone)}`);
  console.log(`  Mode: ${transferMode}`);

  // 1) Create transfer tool (or reuse TOOL_ID if re-running)
  let toolId = (process.env.VAPI_TRANSFER_TOOL_ID || '').trim();
  if (toolId) {
    console.log(`\n1) Reusing transfer tool: ${toolId}`);
  } else {
    console.log('\n1) Creating transferCall tool…');
    const tool = await vapi('POST', '/tool', {
      type: 'transferCall',
      function: {
        name: 'transferCall',
        description:
          'Transfer the caller to Luis Mariscal (owner of Vox.chat) for a live human conversation. Use when the caller asks for a real person, human, live agent, or Luis.',
      },
      messages: [
        {
          type: 'request-start',
          content: 'Connecting you to Luis now. Stay on the line.',
        },
      ],
      destinations: [
        {
          type: 'number',
          number: luisPhone,
          message: 'Please hold while I connect you to Luis.',
          description: 'Luis Mariscal — Vox.chat owner / live human',
          transferPlan: {
            mode: transferMode,
            message:
              'Hi Luis — Vox AI is transferring a website caller who asked to speak with you live.',
          },
        },
      ],
    });
    toolId = tool.id;
    console.log(`   Tool id: ${toolId}`);
  }

  // 2) Load existing assistant so we keep model/voice/etc.
  console.log('\n2) Loading assistant…');
  const existing = await vapi('GET', `/assistant/${assistantId}`);
  const model = { ...(existing.model || {}) };
  model.messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Collect existing tool ids from all known shapes
  const prevToolIds = [
    ...(Array.isArray(existing.model?.toolIds) ? existing.model.toolIds : []),
    ...(Array.isArray(existing.toolIds) ? existing.toolIds : []),
  ];
  const toolIds = [...new Set([...prevToolIds, toolId])];

  // Inline model.tools transferCall is an alternative to toolIds
  const inlineTools = Array.isArray(model.tools)
    ? model.tools.filter((t) => t?.type !== 'transferCall')
    : [];

  // Prefer model.toolIds (API rejected root toolIds). Also try model.tools inline if needed.
  const patchAttempts = [
    {
      label: 'model.toolIds + system prompt',
      body: {
        name: existing.name || 'Vox Voice',
        firstMessage:
          existing.firstMessage ||
          "Hey, thanks for reaching out to Vox.chat. I'm Vox — I help contractors learn how AI can handle their phones, website chat, and Google reviews. What can I help you with?",
        model: {
          provider: model.provider,
          model: model.model,
          temperature: model.temperature,
          maxTokens: model.maxTokens,
          emotionRecognitionEnabled: model.emotionRecognitionEnabled,
          messages: model.messages,
          toolIds,
          ...(inlineTools.length ? { tools: inlineTools } : {}),
        },
        serverUrl: existing.serverUrl || serverUrl,
      },
    },
    {
      label: 'model.tools inline transferCall',
      body: {
        name: existing.name || 'Vox Voice',
        firstMessage:
          existing.firstMessage ||
          "Hey, thanks for reaching out to Vox.chat. I'm Vox — I help contractors learn how AI can handle their phones, website chat, and Google reviews. What can I help you with?",
        model: {
          provider: model.provider,
          model: model.model,
          temperature: model.temperature,
          maxTokens: model.maxTokens,
          messages: model.messages,
          tools: [
            ...inlineTools,
            {
              type: 'transferCall',
              destinations: [
                {
                  type: 'number',
                  number: luisPhone,
                  message: 'Please hold while I connect you to Luis.',
                  description: 'Luis Mariscal — live human',
                  transferPlan: {
                    mode: transferMode,
                    message:
                      'Hi Luis — Vox AI is transferring a website caller who asked to speak with you live.',
                  },
                },
              ],
            },
          ],
        },
        serverUrl: existing.serverUrl || serverUrl,
      },
    },
    {
      label: 'system prompt only (attach tool in dashboard if needed)',
      body: {
        model: {
          provider: model.provider,
          model: model.model,
          temperature: model.temperature,
          maxTokens: model.maxTokens,
          messages: model.messages,
          ...(Array.isArray(model.toolIds) ? { toolIds: model.toolIds } : {}),
          ...(Array.isArray(model.tools) ? { tools: model.tools } : {}),
        },
      },
    },
  ];

  console.log('\n3) Patching assistant…');
  let updated = null;
  let used = null;
  for (const attempt of patchAttempts) {
    try {
      updated = await vapi('PATCH', `/assistant/${assistantId}`, attempt.body);
      used = attempt.label;
      console.log(`   OK via: ${used}`);
      break;
    } catch (e) {
      console.log(`   skip (${attempt.label}): ${e.message}`);
      if (e.details) console.log(`     ${JSON.stringify(e.details)}`);
    }
  }
  if (!updated) fail('All assistant PATCH attempts failed');
  console.log(`   Updated: ${updated.name || assistantId}`);
  console.log(`   Transfer tool id: ${toolId}`);

  console.log(`
✅ Done.

Test:
  1. Open https://vox.chat and start the voice agent (or call your Vapi number).
  2. Say: "I want to speak to a live person" or "Connect me to Luis."
  3. You should hear the connect message, then Luis's phone should ring.

Dashboard:
  https://dashboard.vapi.ai/assistants/${assistantId}
`);
}

main().catch((e) => {
  console.error('\n❌ Setup failed:', e.message);
  if (e.details) console.error(JSON.stringify(e.details, null, 2));
  process.exit(1);
});
