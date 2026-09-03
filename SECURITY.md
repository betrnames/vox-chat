# Security

Vox.chat is a contractor voice/chat product, not a Signal-style messenger.
Processors (Vapi, xAI/OpenAI, Twilio, Vercel, optional Google Sheets / Formspree)
can read conversation content in order to deliver the service. Treat that as the
threat model.

## You do this before merge (3 steps)

I cannot set Vercel env or Vapi dashboard headers from git. Do these once.

### 1. Vercel → Project `vox-chat-claude` → Settings → Environment Variables

Add for **Production** (and Preview if you want the preview branch to work):

| Name | Value |
|------|--------|
| `VAPI_WEBHOOK_SECRET` | generate with `openssl rand -hex 32` — keep it private, not in git |
| `FORMSPREE_ENDPOINT` | `https://formspree.io/f/mwvdpgay` (the form already live on vox.chat) |

`TWILIO_AUTH_TOKEN` should already be there. Leave it.

Redeploy is **not** needed until the PR merges; env is read at request time.

### 2. Vapi dashboard (one header)

Organization (preferred, so web Call-now assistants inherit it) **or** each assistant:

- Server URL: `https://vox.chat/api/voice-webhook`
- Custom header: `x-vapi-secret` = **same value** as `VAPI_WEBHOOK_SECRET`
- Notify-live tool URL: `https://vox.chat/api/voice-luis-live` (same header)

Do **not** put this secret in the website / `VITE_` vars.

### 3. Twilio (10-second check)

Inbound SMS webhook must be exactly:

`https://vox.chat/api/reviews-inbound`

If the URL in Twilio Console matches, you're done. Unsigned requests will be rejected after merge — that's intended.

---

Then merge [PR #1](https://github.com/betrnames/vox-chat/pull/1). Do not merge before steps 1–2 or voice lead capture and email forms fail closed.

## Optional later

| Variable | Why |
|----------|-----|
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | Rate limits survive cold starts |
| `ALLOWED_ORIGINS` | Extra preview domains; `https://vox.chat` is always allowed |

Lock the Google Sheet to the service account + owner only. It is an ops inbox,
not a HIPAA store.

## What this stack does now

- Origin allowlist (no `Access-Control-Allow-Origin: *`)
- Honeypot + rate limits on public lead/chat/SMS endpoints
- Webhook and Twilio signatures fail closed in production
- No Formspree ID in the client; forms POST `/api/lead`
- Logs redact phones, emails, transcripts
- Generic client errors (no key/credit leakage)
- Google Sheet writes use RAW values and neutralize formula injection
- Apps Script webhook host allowlist (`script.google.com`)
- TwiML XML-escaped
- Honest legal copy: standard product is **not** HIPAA / ZDR
- `/.well-known/security.txt` for reports
- CSP allows Daily/Vapi so in-browser Call now still works

## What this stack is not

- Not end-to-end encrypted
- Not HIPAA compliant
- Not zero-retention
- Google Sheets is still plaintext PII if you enable it

## Report a vulnerability

Email [support@vox.chat](mailto:support@vox.chat). Do not file public issues with secrets or customer data.
