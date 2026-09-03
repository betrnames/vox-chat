# Security

Vox.chat is a contractor voice/chat product, not a Signal-style messenger.
Processors (Vapi, xAI/OpenAI, Twilio, Vercel, optional Google Sheets / Formspree)
can read conversation content in order to deliver the service. Treat that as the
threat model.

## Required before production traffic

Set these in Vercel **Production** env (never `VITE_` for secrets):

| Variable | Why |
|----------|-----|
| `VAPI_WEBHOOK_SECRET` | Fail-closed auth on `/api/voice-webhook` and `/api/voice-luis-live` |
| `TWILIO_AUTH_TOKEN` | Validates `/api/reviews-inbound` (`X-Twilio-Signature`) |
| `FORMSPREE_ENDPOINT` | Server-only email relay. No hardcoded form ID. |
| `XAI_API_KEY` | Receptionist. Never sent to the browser. |
| `VAPI_PRIVATE_KEY` | Server-only. Browser uses `VITE_VAPI_PUBLIC_KEY` only. |

### Vapi dashboard

1. Generate a long random secret (`openssl rand -hex 32`).
2. Put it in Vercel as `VAPI_WEBHOOK_SECRET`.
3. On the assistant **Server URL** / tool server, add custom header:
   `x-vapi-secret: <same value>`
4. Server URLs:
   - `https://vox.chat/api/voice-webhook`
   - `https://vox.chat/api/voice-luis-live` (notify-live tool)

If the secret is missing in production, those endpoints return **503** instead of
accepting unsigned traffic.

### Twilio

A message comes in → `https://vox.chat/api/reviews-inbound`.
Unsigned POSTs are rejected in production.

## Optional but recommended

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

## Production go-live (do this before merging to master)

1. Generate `openssl rand -hex 32` → Vercel `VAPI_WEBHOOK_SECRET`.
2. Vapi dashboard: Server URL custom header `x-vapi-secret` with the same value (org-level so **web** transient assistants inherit it).
3. Confirm Twilio webhook URL is exactly `https://vox.chat/api/reviews-inbound` (signature uses the public URL).
4. Set `FORMSPREE_ENDPOINT` or email delivery is skipped (no hardcoded form ID).
5. Optional: Upstash Redis REST for durable rate limits.
6. Lock the Google Sheet to the service account + owner only.

## What this stack is not

- Not end-to-end encrypted
- Not HIPAA compliant
- Not zero-retention
- Google Sheets is still plaintext PII if you enable it

## Report a vulnerability

Email [support@vox.chat](mailto:support@vox.chat). Do not file public issues with secrets or customer data.
