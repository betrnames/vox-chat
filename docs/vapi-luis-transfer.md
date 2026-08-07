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

1. Reuse an existing `transferCall` tool if the assistant already has one (or create one)
2. PATCH the assistant with:
   - full system prompt from `src/voice/vapi-system-prompt.txt` (includes LIVE HUMAN TRANSFER rules)
   - **exactly one** `transferCall` tool + any non-transfer tools (e.g. `notifyLuisLive`)

> **Do not attach two `transferCall` tools.** Vapi fails inbound calls immediately with a message about more than one transfer call type / tool, and never plays `firstMessage`.

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

## Browser vs phone (important)

| Path | How | What the agent should say | What actually happens |
|------|-----|---------------------------|------------------------|
| **Phone** | Dial **(209) 502-3028** from a phone that is **not** 209-996-7102 | “Please hold while I connect you to Luis live” | `transferCall` → Luis cell rings |
| **Browser** | Mic on vox.chat | “I can’t live-transfer from the website — I’ll **text Luis** so he can call you back” | `notifyLuisLive` = **SMS** to Luis (+ optional bridge call). **Not** a live hold-transfer |

Do **not** test phone transfer by calling 502-3028 **from** 996-7102 — destination is busy (you’re on it). Use a second phone.

Do **not** expect the browser mic session to ring Luis’s cell by itself. That always ends in `call.in-progress.error-transfer-failed` if `transferCall` runs on a webCall.

## Test script

### Phone (true live transfer)
1. From a **different** phone than Luis’s cell, dial **(209) 502-3028**
2. Say: **“I want to speak to a live person”** or **“Connect me to Luis”**
3. Expect: connect line → **Luis’s** phone (209-996-7102) rings

### Browser (notify + callback bridge)
1. On desktop (or mobile browser), start voice on https://vox.chat  
2. Say you want a live person  
3. Give a **callback number that is not** Luis’s cell (for a full bridge), or Luis’s cell to test **SMS only**  
4. Expect: agent asks for your number → `notifyLuisLive` → SMS and/or agent line calls you back

## Prompt behavior (summary)

The system prompt tells Vox to:

- Transfer on clear human/Luis/live-agent requests  
- Say one short “connecting you” line, then call the tool  
- Fall back to callback capture if transfer fails  
- Not transfer for ordinary product questions  

## Security

- Never put `VAPI_PRIVATE_KEY` in `VITE_*` env or client code  
- Prefer shell env for one-shot setup; or store private key only in Vercel **server** env if you add a secured admin route later  
