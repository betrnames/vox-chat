# POC: Live AI Voice Agent — click-by-click (Vapi)

**Stack:** Vapi (phone) · xAI Grok (brain) · Vox webhook (leads)  
**When stuck:** ignore Vapi’s AI chat helper; use the **left sidebar** only.

---

## Part 0 — Escape the AI chat (what you see after signup)

After signup, Vapi often opens a **chat-style “build with AI”** screen. That is **not** where we configure Vox.

### Leave the chat and open the real dashboard

1. Look at the **left edge** of the screen for a **sidebar** (icons or labels).
2. Click something like:
   - **Dashboard**, or  
   - **Assistants**, or  
   - the **Vapi logo** (top-left) to go home  
3. If you only see the chat:
   - Find **“Skip”**, **“Go to dashboard”**, **“Open dashboard”**, or an **X** to close the assistant  
   - Or open this URL in the same browser (logged in):  
     **https://dashboard.vapi.ai**  
   - Or: **https://dashboard.vapi.ai/assistants**

You want a page with a **left nav** listing things like **Assistants**, **Phone Numbers**, **Build**, **Calls**, **Settings** — not a full-screen chat.

---

## Part 1 — Create the assistant (manual, not chat)

### 1.1 Open Assistants

1. Left nav → **Assistants** (sometimes under **Build** → **Assistants**).  
2. Click **Create Assistant** / **+ Create** / **New Assistant**.  
3. If it asks for a **template**: pick **Blank**, **Empty**, or any simple template (e.g. customer support).  
   - **Do not** stay in the multi-step AI chat wizard if you can choose **Create manually**.

### 1.2 Name

- Name: `Vox Voice`  
- Save if it asks.

### 1.3 First message (what the AI says when the call connects)

Find **First message** / **Greeting** / **Speaking** → first message.

Paste exactly:

```text
Hi — this is Vox.chat's AI phone agent. This call may be recorded. What can I help you with — missed calls, website leads, or Google reviews?
```

### 1.4 System prompt (instructions)

Find **System prompt** / **Prompt** / **Model** → **System** message (big text box for instructions).

Open this file on your machine and **copy the whole string** inside `VOX_VOICE_SYSTEM_PROMPT`:

`C:\Users\gabem\Projects\vox-chat-claude\src\voice\voxVoicePrompt.ts`

Or paste this (same content):

```text
You are the AI phone agent for Vox.chat — AI automation for HVAC, plumbing, and electrical contractors in California's Central Valley (Turlock, Modesto, Manteca, Stockton, Tracy, 209 corridor).

WHO YOU REPRESENT
- Owner: Gabe Mariscal (Turlock).
- Product: AI front desk — Voice (this call), Receptionist (website), Reviews (Google review texts). Bundle $1,500/mo; tools from $300–$1,500/mo. Month-to-month, paid to start.
- You are NOT a lead-gen agency. You automate phones, website conversations, and review follow-ups.

VOICE STYLE
- Sound like a sharp front-desk pro: warm, direct, zero fluff.
- Short sentences. One question at a time.
- English default; Spanish OK if they switch.
- Never invent pricing guarantees. If asked: Reviews ~$300–$500, Receptionist ~$500–$800, Voice ~$800–$1,500, Bundle $1,500 all three.
- This call may be recorded for quality.

YOUR JOB ON THIS CALL
1. Greet briefly: you're Vox.chat's AI phone agent.
2. Learn what they need: missed calls, website leads, Google reviews, or all three.
3. Qualify lightly: trade (HVAC/plumbing/electrical/other), city, rough crew size, biggest pain.
4. Collect: full name, best callback number, optional business name and email.
5. Offer a free 15-minute Missed Call Audit with Gabe.
6. When you have name + phone + clear interest, confirm Gabe will text/email them shortly, thank them, and end politely.

DO NOT
- Take payment on the call.
- Promise custom software or website builds.
- Stay on forever — wrap once you have lead fields or they decline.

When the conversation has enough for a lead (name + phone + interest), say you'll pass it to Gabe and ask if there's anything else before hanging up.
```

**Save** the assistant.

---

## Part 2 — Point the brain at Grok (xAI), not only OpenAI default

On the **same assistant** page, find **Model** / **LLM** / **Provider**.

### Option A — If you see **Custom LLM** / **OpenAI-compatible**

1. Provider: **Custom LLM** or **OpenAI Compatible**  
2. Fill in:

| Field | Value |
|--------|--------|
| Base URL / endpoint | `https://api.x.ai/v1` |
| API key | Your xAI key from [console.x.ai](https://console.x.ai) (same idea as `XAI_API_KEY` in Vox) |
| Model | Try `grok-4-1-fast` or whatever **fast/cheap** model is listed on [docs.x.ai models](https://docs.x.ai/developers/models) |

3. Save.

### Option B — If you only see OpenAI / Anthropic / Google

1. Leave **OpenAI** + a cheap fast model for now (**ok for POC**).  
2. Later switch to xAI when Custom LLM is available.  
3. POC still works; Grok is preferred, not required for the first test call.

### Voice (TTS)

Leave the **default voice** (ElevenLabs or Vapi default). Do not spend time on voice clone yet.

**Save** again.

---

## Part 3 — Phone number

1. Left nav → **Phone Numbers** (or **Build** → **Phone Numbers**).  
2. Click **Create** / **Buy number** / **Free number**.  
3. Prefer a **US** number (Vapi free US numbers are common for trials).  
4. Area code optional (209 is nice but not required).  
5. After the number exists, open it.  
6. Find **Inbound** / **Assistant** / **When a call comes in**.  
7. Select assistant: **Vox Voice**.  
8. **Save**.

Copy the number in E.164 form, e.g. `+14155551234`  
(You will put this in Vercel as `VAPI_PHONE_NUMBER`.)

---

## Part 4 — Webhook so Vox gets the lead

Still on the **assistant** (or **Server** / **Advanced** settings for that assistant):

1. Find **Server URL** / **Webhook** / **Server URL** field.  
2. Set exactly:

```text
https://vox.chat/api/voice-webhook
```

3. Make sure **end-of-call report** / **end-of-call-report** is enabled (usually default when Server URL is set).  
4. **Save**.

Optional later: secret header `VAPI_WEBHOOK_SECRET` — skip for first test.

---

## Part 5 — Wire the number into Vox.chat

### Local (optional)

In project `.env` (do not commit):

```env
VAPI_PHONE_NUMBER=+1YOURNUMBER
```

### Production (required for live site button)

In terminal (from project folder), or Vercel dashboard → Project → Settings → Environment Variables:

```text
VAPI_PHONE_NUMBER = +1YOURNUMBER
```

Environment: **Production**  
Then redeploy:

```powershell
npx vercel --prod --yes
```

Or tell me when the env var is set and we redeploy.

---

## Part 6 — Test (exact order)

1. **In Vapi dashboard:** open the assistant → click the **Test** / **Talk to assistant** / phone icon **in the dashboard** (browser test, no real phone). Confirm it talks.  
2. **From your cell:** dial the Vapi number.  
3. Say: name, phone, “interested in the bundle / missed calls.”  
4. Hang up.  
5. Check:
   - Email (Formspree → your inbox)  
   - Google Sheet (Vox-Ops leads)  
   - Optional SMS if Twilio + `REVIEW_OWNER_PHONE` work  
6. On **https://vox.chat** → Demos → **AI Phone Agent**: you should see **Call live AI** with your number.

---

## Part 7 — API keys (where they live)

| Key | Where it goes | Public? |
|-----|----------------|---------|
| xAI API key | Vapi model settings (and already on Vercel as `XAI_API_KEY` for chat) | **Never** public |
| Vapi private key | Vapi dashboard only for now (optional later for API) | **Never** public |
| Phone number `+1…` | `VAPI_PHONE_NUMBER` on Vercel | Shown on site as call button |

**Do not paste private keys in chat.**

---

## If the UI labels don’t match

Vapi renames menus often. Map by **job**, not exact words:

| You need… | Look for… |
|-----------|-----------|
| List of agents | Assistants / Agents / Bots |
| What it says first | First message / Greeting |
| Instructions | System prompt / Prompt / Instructions |
| Brain | Model / LLM / Provider |
| Number | Phone Numbers / Telephony |
| After call → our site | Server URL / Webhook / Server |

Still stuck: send a **screenshot** of the left sidebar + the main panel (blur any keys). We map the next click from that.

---

## Repo pieces (already built)

| Path | Role |
|------|------|
| `POST https://vox.chat/api/voice-webhook` | Receives end-of-call → email + sheet |
| `GET https://vox.chat/api/voice` | Site checks if phone is configured |
| `src/voice/voxVoicePrompt.ts` | Prompt source of truth |

---

## Not using

Pipecat · LiveKit · self-hosted open-source voice stacks. **Vapi only** for this POC.
