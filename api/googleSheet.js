/**
 * Append a lead row to Google Sheets via service account (automated path).
 *
 * Env (preferred):
 *   GOOGLE_SHEET_ID
 *   GOOGLE_SERVICE_ACCOUNT_JSON_BASE64  — base64 of full service account JSON
 *
 * Or:
 *   GOOGLE_SERVICE_ACCOUNT_JSON — raw JSON string (private_key may use \n)
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY
 *
 * Fallback:
 *   LEAD_SHEET_WEBHOOK_URL — Apps Script web app
 */

import crypto from 'node:crypto'

function loadServiceAccount() {
  const b64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64
  if (b64) {
    try {
      const json = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
      return {
        email: json.client_email,
        key: String(json.private_key || '').replace(/\\n/g, '\n'),
      }
    } catch (e) {
      console.error('[googleSheet] bad GOOGLE_SERVICE_ACCOUNT_JSON_BASE64')
      return null
    }
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (raw) {
    try {
      const json = JSON.parse(raw)
      return {
        email: json.client_email,
        key: String(json.private_key || '').replace(/\\n/g, '\n'),
      }
    } catch (e) {
      console.error('[googleSheet] bad GOOGLE_SERVICE_ACCOUNT_JSON')
      return null
    }
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  let key = process.env.GOOGLE_PRIVATE_KEY
  if (!email || !key) return null
  return { email, key: key.replace(/\\n/g, '\n') }
}

async function getAccessToken(email, privateKey) {
  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const claim = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  ).toString('base64url')
  const unsigned = `${header}.${claim}`
  const signer = crypto.createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const sig = signer.sign(privateKey, 'base64url')
  const jwt = `${unsigned}.${sig}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok) {
    console.error('[googleSheet] token error', res.status, (await res.text()).slice(0, 300))
    return null
  }
  const data = await res.json()
  return data.access_token || null
}

function rowFromPayload(payload) {
  return [
    payload.timestamp || new Date().toISOString(),
    payload.name || '',
    payload.phone || '',
    payload.email || '',
    payload.business || '',
    payload.city || '',
    payload.trade || '',
    payload.interest || '',
    payload.notes || '',
    payload.source || '',
    payload.site || 'vox.chat',
  ]
}

/** @returns {Promise<boolean>} */
export async function appendLeadToGoogleSheet(payload) {
  const sheetId = process.env.GOOGLE_SHEET_ID
  const sa = loadServiceAccount()
  if (!sheetId || !sa?.email || !sa?.key) return false

  const token = await getAccessToken(sa.email, sa.key)
  if (!token) return false

  const range = process.env.GOOGLE_SHEET_RANGE || 'Leads!A:K'
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}` +
    `/values/${encodeURIComponent(range)}:append` +
    `?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ values: [rowFromPayload(payload)] }),
  })

  if (!res.ok) {
    console.error('[googleSheet] append error', res.status, (await res.text()).slice(0, 400))
    return false
  }
  return true
}

/** Apps Script webhook fallback */
export async function appendLeadViaWebhook(payload) {
  const sheetUrl = process.env.LEAD_SHEET_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL
  if (!sheetUrl) return false

  const body = JSON.stringify(payload)
  let r = await fetch(sheetUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    redirect: 'manual',
  })
  const loc = r.headers.get('location')
  if (loc && (r.status === 301 || r.status === 302 || r.status === 307 || r.status === 308)) {
    r = await fetch(loc, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    })
  }
  return r.ok || r.status === 200 || r.status === 302
}

export async function writeLeadToSheet(payload) {
  if (await appendLeadToGoogleSheet(payload)) return 'sheet'
  if (await appendLeadViaWebhook(payload)) return 'sheet-webhook'
  return null
}
