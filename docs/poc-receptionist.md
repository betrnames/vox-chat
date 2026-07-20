# POC: Live AI Receptionist on vox.chat

Dogfood the product you’re selling: a real AI Receptionist on **your** site that qualifies visitors and emails (and optionally Sheets) you.

## What shipped

| Piece | What it does |
|--------|----------------|
| Floating **Chat with AI** button | Site-wide on homepage |
| `POST /api/receptionist` `mode: "live"` | SpaceXAI (Grok) with Vox.chat sales prompt |
| Lead capture | Model emits structured lead → Formspree email + optional Google Sheet |
| Guided **Demos** tab | Still offline Valley Air Pros flow (sales demo, no API key required) |

## 1. xAI API key (required)

1. Open [console.x.ai](https://console.x.ai) → API keys → create key  
2. **Local:** create `.env` in project root:

```env
XAI_API_KEY=xai-...
```

3. **Vercel:** Project → Settings → Environment Variables →  
   `XAI_API_KEY` = same value → Production (and Preview if you want) → Redeploy  

Without the key, the widget falls back to “call/text / contact form.”

## 2. Email leads (default — already wired)

Uses your existing Formspree form:

`https://formspree.io/f/mwvdpgay`

Override if needed:

```env
FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_ID
```

You’ll get an email when the receptionist collects enough info (phone + name/business + interest).

## 3. Google Sheet (optional, free)

### Create the sheet

1. New Google Sheet, name it **Vox Leads**  
2. Row 1 headers (exact order free-form; script below is flexible):

`timestamp | name | phone | email | business | city | trade | interest | notes | source | site`

### Apps Script webhook

1. Extensions → Apps Script  
2. Paste:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents)
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0]
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
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}
```

3. Deploy → New deployment → Type: **Web app**  
   - Execute as: **Me**  
   - Who has access: **Anyone**  
4. Copy the web app URL → set:

```env
LEAD_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

Same var on Vercel. Redeploy.

## 4. Local test

```bash
# .env has XAI_API_KEY
npm run dev
```

Open http://localhost:5173 → **Chat with AI** (bottom right) → walk a full lead path with a fake phone number → check email / sheet.

## 5. Production checklist

- [ ] `XAI_API_KEY` on Vercel  
- [ ] Formspree still receiving form + chat leads  
- [ ] Optional `LEAD_SHEET_WEBHOOK_URL`  
- [ ] Redeploy after env changes  
- [ ] Test one real conversation on https://vox.chat  

## Security notes (POC)

- API key stays **server-only** (never `VITE_`).  
- Anyone can open the chat (public site). Rate-limit / Turnstile can come later if abused.  
- Leads are best-effort: email first, sheet second; failures don’t break the chat UI.

## Next POCs (when ready)

1. **Reviews** — see [poc-reviews.md](./poc-reviews.md) (live SMS + 1–5 gate)  
2. **Voice** — Twilio/Vapi number → same qualify + notify stack

