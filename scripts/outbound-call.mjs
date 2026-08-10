/**
 * Place an outbound call using the Vox Outbound assistant.
 *
 * Usage:
 *   node scripts/outbound-call.mjs +12095551234
 *   node scripts/outbound-call.mjs +12095551234 "John from ABC Plumbing"
 *   node scripts/outbound-call.mjs --list contacts.csv
 *
 * Env (from .env):
 *   VAPI_PRIVATE_KEY
 *   VAPI_OUTBOUND_ASSISTANT_ID — created by setup-vapi-outbound.mjs
 *   VAPI_PHONE_NUMBER_ID       — the free number to call FROM
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
const privateKey = (process.env.VAPI_PRIVATE_KEY || '').trim();
const assistantId = (process.env.VAPI_OUTBOUND_ASSISTANT_ID || '').trim();
const phoneNumberId = (process.env.VAPI_PHONE_NUMBER_ID || '').trim();

if (!privateKey) {
  console.error('❌ Missing VAPI_PRIVATE_KEY in .env');
  process.exit(1);
}
if (!assistantId) {
  console.error('❌ Missing VAPI_OUTBOUND_ASSISTANT_ID — run setup-vapi-outbound.mjs first');
  process.exit(1);
}
if (!phoneNumberId) {
  console.error('❌ Missing VAPI_PHONE_NUMBER_ID in .env');
  process.exit(1);
}

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return '+1' + digits;
  if (digits.length === 11 && digits[0] === '1') return '+' + digits;
  if (raw.startsWith('+') && digits.length >= 10) return '+' + digits;
  return null;
}

async function placeCall(customerNumber, customerName) {
  const phone = normalizePhone(customerNumber);
  if (!phone) {
    console.error(`❌ Invalid phone: ${customerNumber}`);
    return null;
  }

  console.log(`📞 Calling ${phone}${customerName ? ` (${customerName})` : ''}...`);

  const body = {
    phoneNumberId,
    assistantId,
    customer: {
      number: phone,
      ...(customerName ? { name: customerName } : {}),
    },
  };

  const res = await fetch(`${API}/call`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${privateKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error(`❌ Call failed (${res.status}):`, data.message || JSON.stringify(data));
    return null;
  }

  console.log(`✅ Call initiated: ${data.id}`);
  console.log(`   Status: ${data.status}`);
  return data;
}

function parseCsv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).filter(Boolean);
  const contacts = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || (i === 0 && /phone|name|number/i.test(line))) continue;

    const parts = line.split(',').map((s) => s.trim().replace(/^["']|["']$/g, ''));
    const phone = parts[0];
    const name = parts[1] || '';
    if (phone) contacts.push({ phone, name });
  }

  return contacts;
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Vox Outbound Caller

Usage:
  node scripts/outbound-call.mjs +12095551234
  node scripts/outbound-call.mjs +12095551234 "John from ABC Plumbing"
  node scripts/outbound-call.mjs --list contacts.csv

CSV format (header optional):
  phone,name
  2095551234,John Smith
  2095559876,Maria at Valley HVAC

Calls go out from: ${process.env.VAPI_FREE_NUMBER || 'your VAPI number'}
Assistant: ${assistantId}
`);
    return;
  }

  if (args[0] === '--list' && args[1]) {
    const csvPath = path.resolve(args[1]);
    if (!fs.existsSync(csvPath)) {
      console.error(`❌ File not found: ${csvPath}`);
      process.exit(1);
    }

    const contacts = parseCsv(csvPath);
    console.log(`📋 Loaded ${contacts.length} contacts from ${args[1]}\n`);

    let success = 0;
    let failed = 0;

    for (const contact of contacts) {
      const result = await placeCall(contact.phone, contact.name);
      if (result) {
        success++;
      } else {
        failed++;
      }
      if (contacts.indexOf(contact) < contacts.length - 1) {
        console.log('   Waiting 30s before next call...\n');
        await sleep(30000);
      }
    }

    console.log(`\n📊 Done: ${success} calls placed, ${failed} failed`);
  } else {
    const phone = args[0];
    const name = args.slice(1).join(' ');
    await placeCall(phone, name);
  }
}

main().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
