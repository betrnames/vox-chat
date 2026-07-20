# Google Sheet leads (automated)

Chat leads go to **Formspree email** and automatically **append a row** to a Google Sheet.

## Fast path (recommended)

### A. One-time Google Cloud key (~3 minutes)

1. Create a free GCP project: https://console.cloud.google.com/projectcreate  
2. Enable APIs:  
   - https://console.cloud.google.com/apis/library/sheets.googleapis.com  
   - https://console.cloud.google.com/apis/library/drive.googleapis.com  
3. Create a service account + JSON key:  
   https://console.cloud.google.com/iam-admin/serviceaccounts  
   → Create service account (`vox-leads`)  
   → Keys → Add key → JSON → download  
4. Save the file as:

```
C:\Users\gabem\Projects\vox-chat-claude\google-service-account.json
```

(That path is gitignored — never commit it.)

### B. Run the setup script

```powershell
cd C:\Users\gabem\Projects\vox-chat-claude
node scripts/setup-google-leads.mjs YOUR_GMAIL@gmail.com
```

Use the Google account email you want **editor** access with.

The script will:

- Create a spreadsheet named **Vox Leads**
- Add a **Leads** tab with headers
- Share it with your email
- Write a test row
- Update local `.env`
- Push secrets to **Vercel Production**

### C. Redeploy

```powershell
vercel --prod
```

Or Redeploy in the Vercel dashboard.

### D. Test

Chat with AI → complete a lead → open the sheet. New row should appear (and email still goes to Formspree).

---

## Env vars used in production

| Variable | Purpose |
|----------|---------|
| `GOOGLE_SHEET_ID` | Spreadsheet id |
| `GOOGLE_SHEET_RANGE` | Default `Leads!A:K` |
| `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64` | Base64 of service account JSON |

Optional fallback: `LEAD_SHEET_WEBHOOK_URL` (old Apps Script web app).

---

## npm alias

```powershell
npm run setup:sheet -- you@gmail.com
```
