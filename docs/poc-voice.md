# POC: Live AI Voice Agent on vox.chat

**Stack:** Vapi (phone + agent) · xAI Grok (brain) · Twilio SMS / Formspree / Sheet (notify)  
**Goal:** Caller dials a number → AI qualifies → lead to Gabe (email + sheet + optional SMS).

---

## What ships in this POC

| Piece | Role |
|--------|------|
| Animated **Play call** demo | Unchanged sales demo (Valley Air Pros) |
| **Call the live AI** CTA | Shown when `VAPI_PHONE_NUMBER` is set |
| `GET /api/voice` | Status: online + public phone number |
| `POST /api/voice-webhook` | Vapi **end-of-call-report** → lead notify |
| System prompt | `src/voice/voxVoicePrompt.ts` |

---

## 1. Create a Vapi account

1. Sign up at [vapi.ai](https://vapi.ai)  
2. Create an **Assistant** (dashboard)  
3. **Model:** custom / OpenAI-compatible → xAI  
   - Base URL: `https://api.x.ai/v1`  
   - API key: your `XAI_API_KEY`  
   - Model: e.g. `grok-4-1-fast` or current fast production model (check [docs.x.ai](https://docs.x.ai))  
4. **System prompt:** paste from `src/voice/voxVoicePrompt.ts` → `VOX_VOICE_SYSTEM_PROMPT`  
5. **First message:**  
   `Hi — this is Vox.chat's AI phone agent. Thanks for calling. What can I help you with — missed calls, website leads, or Google reviews?`  
6. **Server URL** (webhooks):  
   `https://vox.chat/api/voice-webhook`  
   Enable **end-of-call-report** (and optionally status-update).  
7. Buy or import a **phone number** in Vapi → attach this assistant  

Optional: structured outputs / analysis fields: `name`, `phone`, `email`, `business`, `city`, `trade`, `interest`, `notes`.

---

## 2. Environment variables

### Local `.env`

```env
# Existing
XAI_API_KEY=xai-...

# Vapi
VAPI_API_KEY=...                 # private — dashboard
VAPI_PHONE_NUMBER=+1...         # public E.164 shown on site
VAPI_WEBHOOK_SECRET=...         # optional shared secret if you add signature checks
VAPI_ASSISTANT_ID=...           # optional, for future API create-call

# Notify Gabe on completed calls (reuse Reviews owner phone)
REVIEW_OWNER_PHONE=+12099967102
```

### Vercel Production

Same keys via `vercel env add` · then `npx vercel --prod`.

**Never** put `VAPI_API_KEY` in `VITE_*` (browser). Only the **phone number** is public.

---

## 3. Webhook events we handle

`POST /api/voice-webhook`

| Event | Action |
|-------|--------|
| `end-of-call-report` | Build lead from analysis / transcript → Formspree + Google Sheet + optional SMS to owner |
| `status-update` / others | Ack 200 (no-op or log) |

Lead `source`: `live-voice`.

---

## 4. Local test

```bash
npm run dev
```

- Without `VAPI_PHONE_NUMBER`: Voice tab = animated demo only.  
- With number set: **Call live AI** `tel:` link appears.  
- Inbound webhooks need a **public URL** (deploy or ngrok → `/api/voice-webhook`).

---

## 5. Production checklist

- [ ] Vapi assistant + number live  
- [ ] System prompt = Vox Voice prompt  
- [ ] Server URL = `https://vox.chat/api/voice-webhook`  
- [ ] Env on Vercel: `VAPI_PHONE_NUMBER`, `XAI_API_KEY` (in Vapi + optionally server)  
- [ ] Test call: leave name + phone → email/sheet row  
- [ ] Optional: SMS to `REVIEW_OWNER_PHONE`  
- [ ] Recording disclosure in first message (CA-aware)

---

## 6. Cost (order of magnitude)

| Layer | Ballpark |
|-------|----------|
| Vapi + STT/TTS + telephony | Often ~$0.15–0.35/min all-in |
| Grok | Token usage on top if not bundled |
| Your price | Voice list **$1,100/mo** or Bundle **$1,500** absorbs normal contractor volume |

See `docs/pricing.md` for margin notes.

---

## 7. Not in this POC

- Inbound forward of client’s business number (that’s client install)  
- Calendar booking integration  
- Multi-tenant per-contractor assistants  
- Browser WebRTC widget (can add later with Vapi Web SDK)

---

## Next after POC works

1. Second assistant: Valley Air Pros demo number (sales demo)  
2. Client onboarding checklist: forward after-hours to Vapi number  
3. Fair-use / minute caps in sales terms  
