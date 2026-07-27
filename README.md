# VoxChat

AI-powered automation platform for home services businesses — HVAC, plumbing, and electrical.

**Live:** [vox-chat-claude.vercel.app](https://vox-chat-claude.vercel.app)

## What it does

VoxChat replaces missed calls with an AI receptionist that qualifies leads, books appointments, and captures contact info — 24/7, no hold music.

- **Voice AI** — Real-time phone handling via Vapi WebRTC
- - **Chat lead capture** — On-site chat widget that routes qualified leads to a Google Sheet CRM
  - - **SMS alerts** — Instant notifications when new leads come in
    - - **SEO blog engine** — 19 locally-optimized blog posts targeting service-area keywords
      - - **Schema markup** — LocalBusiness structured data for search visibility
       
        - ## Tech stack
       
        - | Layer | Tech |
        - |-------|------|
        - | Frontend | TypeScript, Vite, Tailwind CSS |
        - | Voice | Vapi WebRTC |
        - | CRM | Google Sheets API (service account) |
        - | Hosting | Vercel |
        - | SEO | Static blog with OG/Twitter Card meta |
       
        - ## Architecture
       
        - ```
          User call/chat → Vapi voice agent / chat widget
                              ↓
                        Lead qualification
                              ↓
                   Google Sheet + SMS alert
          ```

          Built with Claude as a co-developer (see commit history).
