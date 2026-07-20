# POC: Live AI Reviews on vox.chat

Dogfood the Reviews SKU: real SMS after a “job,” satisfaction first, Google link only on 4–5, owner alert on 1–3.

## What ships

| Piece | What it does |
|--------|----------------|
| **Try Reviews** panel (Demos → AI Reviews) | Enter your phone → receive the contractor SMS flow |
| `POST /api/reviews` | Sends rating ask via Twilio |
| `POST /api/reviews-inbound` | Twilio webhook: parse 1–5 → branch |
| Positive (4–5) | Second SMS with Google review link |
| Negative (1–3) | No public link · Formspree/email (+ sheet) owner alert |
| Rate limit | 3 sends / 10 min per IP (SMS cost guard) |

Guided **Play SMS flow** animation stays offline (no Twilio needed for sales demos).

## Flow

```
Job complete (simulated)
    → SMS: "How was service? Reply 1–5"
    → Customer replies "5"
    → SMS: Google review one-tap link
    → (48h follow-up: not in this POC)

    → Customer replies "2"
    → SMS: "Owner will reach out — no public link"
    → Owner alert email (Formspree) + Vox-Ops sheet row
```

## 1. Twilio (required for live SMS)

1. [twilio.com](https://www.twilio.com) → trial or paid account  
2. Buy or use a US SMS-capable number  
3. **Trial:** verify any phone you will text (Twilio console → Verified Caller IDs)  
4. Messaging → the number → **A message comes in** webhook:

```
https://vox.chat/api/reviews-inbound
```

Method: `HTTP POST`

5. Vercel env (Production):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_FROM_NUMBER=+1XXXXXXXXXX
TWILIO_TRIAL=true
GOOGLE_REVIEW_URL=https://vox.chat
```

**Trial restriction:** free accounts cannot send custom SMS copy. Body must be a Twilio template name:

| Flow | Template (`Body`) |
|------|-------------------|
| Rating ask (1–5) | `sms_feedback_surveys` |
| Positive follow-up | `sms_customer_support` |
| Negative follow-up | `sms_account_alerts` |
| Owner alert | `sms_internal_alerts` |

After you **Upgrade** Twilio, set `TWILIO_TRIAL=false` to send real Vox copy + Google review URL.

Optional:

```env
# SMS Gabe on negative ratings (defaults to email-only if unset)
REVIEW_OWNER_PHONE=+12099967102
# Override trial templates if needed
# TWILIO_TEMPLATE_RATING=sms_feedback_surveys
```

Local `.env` same keys → `npm run dev`.

## 2. Email / sheet (already on project)

Negative path and send logs reuse:

- Formspree (`FORMSPREE_ENDPOINT` or default)
- Google Sheet service account (same as receptionist leads)

Sheet rows use `source: live-reviews` and notes describing the event.

## 3. Local test

```bash
# .env has Twilio + XAI not required for reviews
npm run dev
```

1. Open http://localhost:5173 → Demos → **AI Reviews**  
2. **Try on your phone** → enter a **Twilio-verified** number  
3. Reply `5` or `2` from your phone  
4. Check second SMS / owner email / sheet  

**Note:** Vite dev can send SMS (`POST /api/reviews`). Inbound webhooks need a public URL (ngrok → `https://xxx.ngrok.io/api/reviews-inbound`) or test inbound only on production.

## 4. Production checklist

- [ ] `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` on Vercel  
- [ ] `GOOGLE_REVIEW_URL` set to a real GBP review link (or demo URL)  
- [ ] Twilio number webhook → `https://vox.chat/api/reviews-inbound`  
- [ ] Redeploy after env changes  
- [ ] One full path: send → reply 5 → link · send → reply 2 → owner alert  

## Security notes (POC)

- Twilio credentials **server-only** (never `VITE_`).  
- Strict rate limit on send.  
- Phone normalized to E.164 US when possible.  
- Pending ratings kept in memory (fine for demo; multi-instance may miss a reply — sheet log still records sends).  
- No customer PII stored long-term beyond sheet/email you already use for leads.

## Not in this POC

- True 2-hour delay after job (trigger is manual “send now”)  
- 48-hour follow-up if no reply  
- Multi-tenant per-contractor numbers / GBP links  
- Monthly review growth report  

Those are production SKU features after first paying Reviews client.

## Next after Reviews

**Voice** — Twilio/Vapi number → qualify + book + notify (same lead stack).
