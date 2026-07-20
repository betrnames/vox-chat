# Google Sheet lead capture (free)

Leads from the live AI Receptionist go to email (Formspree) **and** optionally a Google Sheet via a free Apps Script webhook.

## Step 1 — Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) → **Blank** spreadsheet  
2. Name it **Vox Leads**  
3. In **row 1**, type these headers (one per column):

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| timestamp | name | phone | email | business | city | trade | interest | notes | source | site |

## Step 2 — Open Apps Script

1. In the sheet menu: **Extensions** → **Apps Script**  
2. Delete any placeholder code in `Code.gs`  
3. Paste **all** of this:

```javascript
function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}'
    var data = JSON.parse(raw)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]

    // Header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'timestamp', 'name', 'phone', 'email', 'business',
        'city', 'trade', 'interest', 'notes', 'source', 'site',
      ])
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.business || '',
      data.city || '',
      data.trade || '',
      data.interest || '',
      data.notes || '',
      data.source || '',
      data.site || 'vox.chat',
    ])

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

/** Optional: open the web app URL in a browser to confirm deploy works */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, service: 'vox-leads' }))
    .setMimeType(ContentService.MimeType.JSON)
}
```

4. Click the **Save** disk icon (or Ctrl+S)  
5. Project name: **Vox Leads Webhook** → OK  

## Step 3 — Deploy as web app

1. Top right: **Deploy** → **New deployment**  
2. Click the gear ⚙️ next to “Select type” → choose **Web app**  
3. Settings:

   | Field | Value |
   |--------|--------|
   | Description | `vox leads v1` |
   | Execute as | **Me** (your Google account) |
   | Who has access | **Anyone** |

   (“Anyone” is required so Vercel’s servers can POST without Google login.)

4. Click **Deploy**  
5. First time: **Authorize access** → pick your Google account →  
   Advanced → **Go to Vox Leads Webhook (unsafe)** → **Allow**  
6. Copy the **Web app URL**  
   It looks like:  
   `https://script.google.com/macros/s/AKfycb.../exec`

## Step 4 — Wire Vox.chat

### Local (`.env` in project root)

```env
LEAD_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/PASTE_YOUR_ID/exec
```

Keep `XAI_API_KEY=...` as you already set. Restart `npm run dev`.

### Vercel (production)

1. Project → **Settings** → **Environment Variables**  
2. **Key:** `LEAD_SHEET_WEBHOOK_URL`  
3. **Value:** same `/exec` URL  
4. Environments: **Production** (+ Preview if you want)  
5. **Save**  
6. **Deployments** → ⋯ on latest → **Redeploy**

## Step 5 — Test

### A) Quick webhook test (optional)

In PowerShell (replace the URL):

```powershell
Invoke-RestMethod -Method Post -Uri "https://script.google.com/macros/s/YOUR_ID/exec" -ContentType "text/plain;charset=utf-8" -Body '{"timestamp":"test","name":"Test Lead","phone":"2095550100","source":"manual-test","site":"vox.chat"}'
```

Refresh the sheet — you should see a new row.

### B) Real chat test

1. Local or live site → **Chat with AI**  
2. Complete a fake lead (name + phone + interest)  
3. Sheet should get a row; Formspree should still email you  
4. Widget may show **Lead sent**

## If rows don’t appear

| Issue | Fix |
|--------|-----|
| Forgot to authorize | Deploy again → Authorize |
| “Anyone” not selected | New deployment with access = Anyone |
| Edited script after deploy | **Deploy** → **Manage deployments** → ✏️ edit → **New version** → Deploy |
| Wrong env on Vercel | Check name is exactly `LEAD_SHEET_WEBHOOK_URL`, then redeploy |
| Local still old env | Restart `npm run dev` after editing `.env` |

## Security note (POC)

The web app URL is a secret-ish write endpoint (anyone with the URL can append rows). Don’t post it publicly. Later you can add a shared secret header/body field.
