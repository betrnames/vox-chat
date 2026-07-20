/**
 * Wire Google Sheet lead capture for Vox.chat
 *
 * Free Google accounts: service accounts CANNOT create files (0 Drive quota).
 * So you create the sheet once, share it with the SA, then this script finishes setup.
 *
 * Usage:
 *   node scripts/setup-google-leads.mjs email@vox.chat --sheet=SHEET_ID_OR_URL
 *
 * Example:
 *   node scripts/setup-google-leads.mjs email@vox.chat --sheet=https://docs.google.com/spreadsheets/d/1abc.../edit
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

function parseSheetId(input) {
  if (!input) return null
  const m = String(input).match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  if (m) return m[1]
  if (/^[a-zA-Z0-9-_]{20,}$/.test(input)) return input
  return null
}

function printHelp(saEmail) {
  console.log(`
Vox.chat — Google Sheet leads (free Google accounts)
====================================================

Service accounts have **no Drive storage**, so they cannot *create* a sheet.
You create it in 30 seconds; the script wires headers + Vercel.

STEP 1 — Create a blank sheet while logged into Google as email@vox.chat
  https://sheets.google.com/create

STEP 2 — Name it "Vox Leads"

STEP 3 — Share the sheet with this service account as **Editor**:
  ${saEmail || '(from google-service-account.json)'}

  Share button → paste that email → Editor → Send
  (Uncheck "Notify people" if you want)

STEP 4 — Copy the sheet URL from the browser, then run:

  node scripts/setup-google-leads.mjs email@vox.chat --sheet=PASTE_URL_HERE

Example:
  node scripts/setup-google-leads.mjs email@vox.chat --sheet=https://docs.google.com/spreadsheets/d/1AbC.../edit
`)
}

async function main() {
  const shareWith = process.argv[2]
  const sheetArg = process.argv.find((a) => a.startsWith('--sheet='))
  const sheetId = parseSheetId(sheetArg ? sheetArg.slice('--sheet='.length) : null)

  if (!fs.existsSync(keyPath)) {
    console.error(`Missing ${keyPath}`)
    process.exit(1)
  }

  const sa = JSON.parse(fs.readFileSync(keyPath, 'utf8'))
  if (!sa.client_email || !sa.private_key) {
    console.error('Invalid service account JSON')
    process.exit(1)
  }

  if (!shareWith || !shareWith.includes('@') || !sheetId) {
    printHelp(sa.client_email)
    process.exit(sheetArg || shareWith ? 1 : 0)
  }

  console.log('Auth as', sa.client_email)
  console.log('Sheet ID', sheetId)

  const token = await getToken(sa.client_email, sa.private_key, [
    'https://www.googleapis.com/auth/spreadsheets',
  ])

  // Read spreadsheet metadata
  const metaRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=spreadsheetId,properties.title,sheets.properties`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const meta = await metaRes.json()
  if (!metaRes.ok) {
    console.error(`
Cannot access sheet (${metaRes.status}): ${meta.error?.message || JSON.stringify(meta)}

Make sure you shared the sheet with this address as Editor:
  ${sa.client_email}
`)
    process.exit(1)
  }
  console.log('Opened sheet:', meta.properties?.title)

  // Prefer a tab named Leads; otherwise first sheet, rename not required — use first title
  let tab = 'Leads'
  const titles = (meta.sheets || []).map((s) => s.properties?.title).filter(Boolean)
  if (!titles.includes('Leads')) {
    // Create Leads tab
    const batch = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ addSheet: { properties: { title: 'Leads' } } }],
      }),
    })
    if (!batch.ok) {
      console.warn('Could not add Leads tab, using first sheet:', titles[0])
      tab = titles[0] || 'Sheet1'
    } else {
      console.log('Created tab "Leads"')
    }
  }

  // Vox-Ops Leads headers live on row 4; do not overwrite if sheet already has them.
  // Only write headers when row 4 is empty.
  const peekRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(`${tab}!A4:O4`)}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const peek = await peekRes.json()
  const existing = (peek.values && peek.values[0]) || []
  if (existing.length === 0) {
    const headers = [
      'Date',
      'Source',
      'Name',
      'Business',
      'Trade',
      'City',
      'Phone',
      'Email',
      'Status',
      'Interest',
      'Quoted $/mo',
      'Est. monthly leak $',
      'Next step',
      'Next date',
      'Notes',
    ]
    const putRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(`${tab}!A4:O4`)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [headers] }),
      },
    )
    if (!putRes.ok) {
      console.error('Header write failed:', await putRes.text())
      process.exit(1)
    }
    console.log(`Wrote Vox-Ops headers on ${tab}!A4:O4`)
  } else {
    console.log(`Keeping existing headers on ${tab}:`, existing.slice(0, 8).join(' | '), '...')
  }

  // Test row (Vox-Ops Leads columns)
  const appendRange = `${tab}!A:O`
  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [
          [
            new Date().toISOString().slice(0, 10),
            'setup-script',
            'Setup Test',
            'Vox.chat',
            'other',
            'Turlock',
            '2095550100',
            shareWith,
            'New',
            'setup',
            '',
            '',
            'Follow up',
            '',
            'Automated setup — safe to delete',
          ],
        ],
      }),
    },
  )
  if (!appendRes.ok) {
    console.error('Test append failed:', await appendRes.text())
    process.exit(1)
  }
  console.log('Test row appended (you should see "Setup Test" on the Leads tab)')

  const b64 = Buffer.from(JSON.stringify(sa), 'utf8').toString('base64')
  const envFile = path.join(root, '.env')
  upsertEnv(envFile, {
    GOOGLE_SHEET_ID: sheetId,
    GOOGLE_SHEET_RANGE: `${tab}!A:O`,
    GOOGLE_SHEET_FORMAT: 'vox-ops',
    GOOGLE_SERVICE_ACCOUNT_JSON_BASE64: b64,
  })
  console.log('Updated local .env')

  console.log('Setting Vercel Production env...')
  const ok1 = vercelSet('GOOGLE_SHEET_ID', sheetId)
  const ok2 = vercelSet('GOOGLE_SHEET_RANGE', `${tab}!A:O`)
  const ok3 = vercelSet('GOOGLE_SHEET_FORMAT', 'vox-ops')
  const ok4 = vercelSet('GOOGLE_SERVICE_ACCOUNT_JSON_BASE64', b64)
  console.log(ok1 && ok2 && ok3 && ok4 ? 'Vercel env OK' : 'Some Vercel env vars failed — set manually if needed')

  console.log(`
========================================
DONE — Google Sheet lead capture ready
========================================
Sheet:  https://docs.google.com/spreadsheets/d/${sheetId}/edit
Tab:    ${tab}

Redeploy production:
  vercel --prod

Then Chat with AI leads will appear as new rows (plus Formspree email).
`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
