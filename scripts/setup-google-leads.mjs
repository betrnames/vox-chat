/**
 * Automate Google Sheet lead capture for Vox.chat
 *
 * ONE-TIME (you): create a free Google Cloud service account JSON (3 min)
 * THEN (this script): creates the sheet, shares it, wires .env + Vercel
 *
 *   node scripts/setup-google-leads.mjs you@gmail.com
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const keyPath = path.join(root, 'google-service-account.json')

async function getToken(email, privateKey, scopes) {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: scopes.join(' '),
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url')
  const unsigned = `${header}.${claim}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const jwt = `${unsigned}.${signer.sign(privateKey, 'base64url')}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  const data = await res.json()
  if (!data.access_token) throw new Error(`Token failed: ${JSON.stringify(data)}`)
  return data.access_token
}

function upsertEnv(file, entries) {
  let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  for (const [key, value] of Object.entries(entries)) {
    const line = `${key}=${value}`
    const re = new RegExp(`^${key}=.*$`, 'm')
    if (re.test(text)) text = text.replace(re, line)
    else text = `${text.trimEnd()}\n${line}\n`
  }
  fs.writeFileSync(file, text, 'utf8')
}

function vercelSet(key, value) {
  spawnSync('vercel', ['env', 'rm', key, 'production', '-y'], {
    cwd: root,
    stdio: 'ignore',
    shell: true,
  })
  const r = spawnSync('vercel', ['env', 'add', key, 'production'], {
    cwd: root,
    input: `${value}\n`,
    encoding: 'utf8',
    shell: true,
  })
  return r.status === 0
}

async function main() {
  const shareWith = process.argv[2]
  if (!shareWith || !shareWith.includes('@')) {
    console.log(`
Vox.chat — automated Google Sheet leads
========================================

I can create the sheet and wire production once you drop a free
Google Cloud service account key in the project (one-time, ~3 min).

STEP A — Create the key (browser)
  1. https://console.cloud.google.com/projectcreate
     (name it "vox-leads" or use any project)
  2. Enable these APIs:
     https://console.cloud.google.com/apis/library/sheets.googleapis.com
     https://console.cloud.google.com/apis/library/drive.googleapis.com
  3. https://console.cloud.google.com/iam-admin/serviceaccounts
     → Create service account → name "vox-leads"
     → Keys → Add key → Create new key → JSON
  4. Save the downloaded file as:
     ${keyPath}

STEP B — Run this again with YOUR Google email (to get editor access)
  node scripts/setup-google-leads.mjs you@gmail.com
`)
    process.exit(shareWith ? 1 : 0)
  }

  if (!fs.existsSync(keyPath)) {
    console.error(`\nMissing key file:\n  ${keyPath}\n`)
    console.error('Complete STEP A above, then re-run.\n')
    process.exit(1)
  }

  const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
  if (!sa.client_email || !sa.private_key) {
    console.error('Invalid service account JSON')
    process.exit(1)
  }

  console.log('Auth as', sa.client_email)
  const token = await getToken(sa.client_email, sa.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
  ])

  console.log('Creating spreadsheet "Vox Leads"...')
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: { title: 'Vox Leads' },
      sheets: [{ properties: { title: 'Leads' } }],
    }),
  })
  const created = await createRes.json()
  if (!created.spreadsheetId) {
    throw new Error(`Create failed: ${JSON.stringify(created)}`)
  }

  const sheetId = created.spreadsheetId
  const sheetUrl =
    created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
  console.log('Created:', sheetUrl)

  const headers = [
    'timestamp',
    'name',
    'phone',
    'email',
    'business',
    'city',
    'trade',
    'interest',
    'notes',
    'source',
    'site',
  ]
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Leads!A1:K1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [headers] }),
    },
  )
  console.log('Headers written on tab "Leads"')

  console.log('Sharing editor access with', shareWith)
  const shareRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${sheetId}/permissions?sendNotificationEmail=true`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'user',
        role: 'writer',
        emailAddress: shareWith,
      }),
    },
  )
  if (!shareRes.ok) console.warn('Share warning:', await shareRes.text())
  else console.log('Shared (check email / Drive shared with me)')

  // test row
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Leads!A:K:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            new Date().toISOString(),
            'Setup Test',
            '2095550100',
            shareWith,
            'Vox.chat',
            'Turlock',
            'other',
            'setup',
            'Automated setup — safe to delete',
            'setup-script',
            'vox.chat',
          ],
        ],
      }),
    },
  )
  console.log('Test row appended')

  const b64 = Buffer.from(JSON.stringify(sa), 'utf8').toString('base64')
  const envFile = path.join(root, '.env')
  upsertEnv(envFile, {
    GOOGLE_SHEET_ID: sheetId,
    GOOGLE_SHEET_RANGE: 'Leads!A:K',
    GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: b64,
  })
  console.log('Updated local .env')

  console.log('Setting Vercel Production env...')
  const ok1 = vercelSet('GOOGLE_SHEET_ID', sheetId)
  const ok2 = vercelSet('GOOGLE_SHEET_RANGE', 'Leads!A:K')
  const ok3 = vercelSet('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64', b64)
  console.log(ok1 && ok2 && ok3 ? 'Vercel env OK' : 'Set any failed vars manually in Vercel dashboard')

  console.log(`
========================================
DONE — Google Sheet lead capture is live
========================================
Sheet:  ${sheetUrl}
Local:  .env has GOOGLE_SHEET_ID + GOOGLE_SERVICE_ACCOUNT_JSON_BASE64

Redeploy production so the API loads the new secrets:
  vercel --prod

After deploy, Chat with AI leads append to the "Leads" tab
AND still email via Formspree.

Keep google-service-account.json private (gitignored).
`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
