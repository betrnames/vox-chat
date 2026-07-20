# Vox.chat — session handoff (resume here)

**Last paused:** 2026-07-20  
**Live site:** https://vox.chat  
**Repo:** `betrnames/vox-chat` · branch `master`  
**Stack:** Vite + React + TS + Tailwind · Vercel · Formspree · Google Sheet (Vox-Ops) · xAI Grok · Twilio (trial)

---

## Resume prompt (paste next session)

> Resume vox.chat from `docs/HANDOFF.md`.  
> Public live POC = **AI Receptionist only**. Reviews SMS built but UI hidden until Twilio upgrade.  
> Next product build = **Voice POC (Vapi + Grok + Twilio notify)**.  
> Pricing in `docs/pricing.md` · objections in `docs/objections.md` — review before sales calls.  
> Contact: **support@vox.chat** · ops: **email@vox.chat**.

---

## Product status (public site)

| SKU | What visitors see | Backend |
|-----|-------------------|---------|
| **AI Receptionist** | **Live POC** — widget + mobile bar | `/api/receptionist` · Grok · email gate · rate limit · Formspree + Sheet |
| **AI Reviews** | **Animated demo only** | APIs ready; UI hidden until Twilio upgrade for custom copy |
| **AI Voice** | **Animated playback only** | Not built — **next major POC** |

**Public rule:** only Receptionist is real interactive proof on the marketing site.

---

## Pricing & sales docs

| Doc | Use |
|-----|-----|
| **`docs/pricing.md`** | List prices, floors, setup, margins, close checklist |
| **`docs/objections.md`** | Hard nos, scripts, “too expensive” |
| **`docs/gtm-playbook.md`** | ICP, BNI, audit flow, pay-then-setup |

| SKU | List (quote) | Floor |
|-----|--------------|-------|
| Reviews | **$400/mo** | $300 |
| Receptionist | **$650/mo** | $500 |
| Voice | **$1,100/mo** | $800 |
| Bundle | **$1,500/mo** | **$1,500 (no discount)** |

- **Setup fee:** $0 listed — included; **first month paid in advance** unlocks setup  
- **Default close:** Bundle · budget path: Reviews → add Voice in 30–60 days

---

## What shipped this era (high level)

1. Receptionist live POC + “Receptionist” not “chat” branding  
2. Mobile bar + desktop FAB lifts above footer  
3. Reviews SMS POC (Twilio trial templates) — UI removed after test  
4. Theme switch site-wide; mobile switch in hamburger  
5. Lean trust pack: Legal SMS/TCPA + recording · form consent · subtle hero trust strip  
6. Contact email **support@vox.chat** · system/ops **email@vox.chat**  
7. Pricing & objection playbook  

---

## Env (Vercel Production)

- `XAI_API_KEY`
- Google Sheet SA + `GOOGLE_SHEET_*`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (+17372324091)
- `TWILIO_TRIAL=true`
- `GOOGLE_REVIEW_URL=https://vox.chat` (GBP pending verification)
- `REVIEW_OWNER_PHONE=+12099967102`

Local: `.env` (never commit).

**Twilio inbound (Reviews, when UI returns):**  
`https://vox.chat/api/reviews-inbound` · HTTP POST on the Twilio number.

---

## Next when resuming (priority order)

### 1. Voice agent POC
| Layer | Choice |
|-------|--------|
| Runtime | **Vapi** (or Retell) |
| LLM | **Grok / xAI** |
| Notify | **Twilio SMS** |
| Optional | ElevenLabs voice skin |

Thin dial-in POC ~**2–5 days** · sellable after-hours MVP ~**1–2 weeks**.

### 2. Sales hygiene (no code)
- Create Stripe Payment Links at **list** prices  
- Drill `docs/pricing.md` + `docs/objections.md`  
- Run Missed Call Audits in Turlock / Modesto / Manteca  

### 3. Reviews (after Twilio upgrade)
- `TWILIO_TRIAL=false` · restore Try-on-phone UI · real GBP review URL  

### 4. GBP
- Pending verification · then set `GOOGLE_REVIEW_URL`  

---

## Key paths

| Path | Purpose |
|------|---------|
| `docs/HANDOFF.md` | This file |
| `docs/pricing.md` | **Prices, floors, setup, margins** |
| `docs/objections.md` | **Hard nos, scripts** |
| `docs/gtm-playbook.md` | ICP, scripts, audit flow |
| `docs/poc-receptionist.md` / `poc-reviews.md` | POC setup |
| `src/App.tsx` · `LiveReceptionistWidget.tsx` | Site + live chat |
| `api/receptionist.js` · `api/reviews*.js` | APIs |

---

## Dev / deploy

```bash
npm run dev
npx vercel --prod --yes
```

**Phone:** (209) 996-7102 · **Contact:** support@vox.chat · **Ops:** email@vox.chat · **X:** @voxdotchat  

---

## Do not

- Show trial Twilio template SMS on the marketing site  
- Commit `.env` or service account JSON  
- Discount Bundle below $1,500  
- Free product months / Net 30 / custom RFPs  
- Cloudflare Workers unless explicitly asked  
- Inter / Roboto / purple gradients  
