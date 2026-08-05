# Live transfer to Luis (Vapi)

When a website voice visitor asks for a **live person** / **Luis**, the Vox assistant transfers the call to Luis’s phone using Vapi’s `transferCall` tool.

## What you need

| Item | Where |
|------|--------|
| Existing Vox assistant | `VITE_VAPI_ASSISTANT_ID` in `.env` |
| **Private** Vapi API key | Dashboard → Account → API Keys (not the public web key) |
| Luis destination number | **`+12099967102`** (209-996-7102) — cell that should ring |
| Free Vapi number | **`+12095023028`** (209-502-3028) — inbound line + outbound “from” for ring-Luis |

> The **public** key (`VITE_VAPI_PUBLIC_KEY`) only starts browser calls. Creating tools / updating assistants needs the **private** key.

## Fast path (API script)

From `vox-chat-claude`:

```powershell
# Private key from https://dashboard.vapi.ai (Account → API Keys)
$env:VAPI_PRIVATE_KEY = "sk_..."   # paste once; do not commit
$env:LUIS_PHONE_NUMBER = "+1XXXXXXXXXX"  # Luis / transfer destination E.164

node scripts/setup-vapi-luis-transfer.mjs
```

The script will:

1. Create a `transferCall` tool → `LUIS_PHONE_NUMBER` (**blind transfer** by default)
2. PATCH your existing assistant with:
   - full system prompt from `src/voice/vapi-system-prompt.txt` (includes LIVE HUMAN TRANSFER rules)
   - the new tool attached

### Important: warm vs blind transfer

- **Blind transfer (default)** works on website web calls and Vapi-provider numbers.
- **Warm transfer** modes only work with **Twilio-based** telephony (per Vapi docs).  
  Using warm transfer on a web call caused: `call.in-progress.error-transfer-failed`.

Optional: `$env:VAPI_TRANSFER_MODE = "warm-transfer-with-message"` only if the call path is Twilio.

## Manual path (dashboard)

### 1. Transfer tool

1. https://dashboard.vapi.ai → **Tools** → **Create Tool**
2. Type: **Transfer Call**
3. Destination number: Luis’s E.164 number
4. Message: `Please hold while I connect you to Luis.`
5. Prefer **warm transfer** if available
6. Save — copy tool id if shown

### 2. Attach to assistant

1. **Assistants** → open the Vox Voice assistant (same id as `VITE_VAPI_ASSISTANT_ID`)
2. **Tools** → add the transfer tool
3. **System prompt** → replace with full contents of  
   `src/voice/vapi-system-prompt.txt`
4. Save

### 3. Phone number (optional inbound)

If Vapi gave you a **custom inbound** number:

1. **Phone Numbers** → open that number  
2. Inbound assistant = Vox Voice  
3. Save  

Outbound transfer to Luis does **not** require that number; it only needs the destination in the transfer tool.

## Test script

1. Start voice on https://vox.chat (or dial the Vapi number)
2. Say: **“I want to speak to a live person”** or **“Connect me to Luis”**
3. Expect: short connect line → Luis’s phone rings

## Prompt behavior (summary)

The system prompt tells Vox to:

- Transfer on clear human/Luis/live-agent requests  
- Say one short “connecting you” line, then call the tool  
- Fall back to callback capture if transfer fails  
- Not transfer for ordinary product questions  

## Security

- Never put `VAPI_PRIVATE_KEY` in `VITE_*` env or client code  
- Prefer shell env for one-shot setup; or store private key only in Vercel **server** env if you add a secured admin route later  
