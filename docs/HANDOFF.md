# Vox.chat — session handoff (resume here)

**Last paused:** 2026-07-20  
**Live site:** https://vox.chat  
**Repo:** `betrnames/vox-chat` · branch `master`  
**Stack:** Vite + React + TS + Tailwind · Vercel · Formspree · Google Sheet (Vox-Ops) · xAI Grok · Twilio (trial)

---

## Product status (public site)

| SKU | What visitors see | Backend |
|-----|-------------------|---------|
| **AI Receptionist** | **Live POC** — floating widget + mobile bar | `/api/receptionist` · Grok · email gate · rate limit · Formspree + Sheet |
| **AI Reviews** | **Animated demo only** (no live “text me”) | APIs ready: `/api/reviews`, `/api/reviews-inbound` — UI hidden until Twilio **upgrade** (custom copy) |
| **AI Voice** | **Animated call playback only** | Not built — **next major POC** |

**Public rule:** only Receptionist is a real interactive proof. Reviews SMS was proven end-to-end on trial, then UI removed so trial template copy isn’t customer-facing.

---

## What shipped recently

1. Receptionist branding (not “chat”) · mobile bottom bar · seamless SVG dome over call button  
2. SEO SSG/prerender · og image · Formspree + Google Sheet leads  
3. Live Reviews POC: Twilio trial templates (`TWILIO_TRIAL=true`), webhook inbound 1–5  
4. Live Reviews UI **hidden** after successful test  
5. Theme: pill **switch** site-wide (`src/theme.tsx`); mobile switch in hamburger  
6. Lean trust pack: Legal SMS/TCPA + recording · form consent · hero trust strip

---

## Env (Vercel Production — already set)

- `XAI_API_KEY`
- `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_RANGE`, `GOOGLE_SHEET_FORMAT`, `GOOGLE_SERVICE_ACCOUNT_JSON_BASE64`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` (`+17372324091`)
- `TWILIO_TRIAL=true`
- `GOOGLE_REVIEW_URL=https://vox.chat` (GBP pending verification)
- `REVIEW_OWNER_PHONE=+12099967102`

Local: same keys in `.env` (never commit).

**Twilio webhook (for when Reviews UI returns):**  
Number → Messaging → A message comes in → `https://vox.chat/api/reviews-inbound` · HTTP POST

---

## Next when resuming

### 1. Voice agent POC (priority)

**Recommended stack**

| Layer | Choice |
|-------|--------|
| Phone + agent runtime | **Vapi** (or Retell) |
| LLM | **Grok / xAI** (same qualify → lead rails as receptionist) |
| Notify contractor | **Twilio SMS** (existing) |
| ElevenLabs | Optional voice skin only |

**Not first:** raw Grok voice alone (no PSTN), pure ElevenLabs, full DIY Twilio Voice stack.

**Rough time:** thin live dial-in POC **2–5 days** · sellable after-hours MVP **1–2 weeks**.

**MVP shape:** Vapi number → Grok system prompt (Valley / Vox sales) → capture lead → SMS/email Gabe · optional link from vox.chat “Call the AI”.

### 2. Reviews (after Twilio upgrade)

1. Upgrade Twilio · set `TWILIO_TRIAL=false`  
2. Restore “Try on your phone” UI (was `LiveReviewTry` in `App.tsx` — re-add from git history or `docs/poc-reviews.md`)  
3. Real GBP review link when verification completes  
4. Custom SMS copy: rating ask + Google link / owner alert  

### 3. GBP

- Profile **created**, **pending verification**  
- Until verified: `GOOGLE_REVIEW_URL=https://vox.chat` is fine  

---

## Key paths

| Path | Purpose |
|------|---------|
| `src/App.tsx` | Homepage, demos, mobile bar |
| `src/LiveReceptionistWidget.tsx` | Live receptionist |
| `src/theme.tsx` | `useTheme` + `ThemeSwitch` |
| `api/receptionist.js` | Live chat API |
| `api/reviews.js` · `reviews-inbound.js` · `reviewsShared.js` | Reviews SMS |
| `api/googleSheet.js` | Leads → Vox-Ops sheet |
| `docs/poc-receptionist.md` | Receptionist setup |
| `docs/poc-reviews.md` | Reviews + trial templates |
| `docs/gtm-playbook.md` | Sales / SKUs |
| `docs/HANDOFF.md` | This file |

---

## Dev / deploy

```bash
npm run dev          # localhost:5173
npm run build
npx vercel --prod --yes
```

**Formspree:** default form id in code (leads + review events).  
**Phone:** (209) 996-7102 · **Contact:** support@vox.chat · **Ops/other:** email@vox.chat · X: @voxdotchat  

---

## Resume prompt (paste for next session)

> Resume vox.chat from `docs/HANDOFF.md`. Public live POC is AI Receptionist only. Reviews SMS is built but UI hidden until Twilio upgrade. Next build: Voice agent POC with **Vapi + Grok + Twilio notify**. Theme switch is site-wide via `src/theme.tsx`.

---

## Do not

- Show trial Twilio template SMS on the marketing site  
- Commit `.env` or service account JSON  
- Start Cloudflare Workers (Vercel only unless asked)  
- Use Inter/Roboto/purple gradients (brand system in `CLAUDE.md`)
