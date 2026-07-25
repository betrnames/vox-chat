/** Deterministic multi-step Vox.chat sales flow for the guided demo. */

export type ChatStep =
  | 'idle'
  | 'qualify_trade'
  | 'qualify_crew'
  | 'qualify_pain'
  | 'assessment'
  | 'collect_name'
  | 'collect_phone'
  | 'complete'

export type ChatMemory = {
  trade?: string
  crewSize?: number
  pain?: string
  name?: string
  phone?: string
}

function extractPhone(text: string): string | null {
  const m = text.match(/\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})\b/)
  return m ? m[1].replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : null
}

function detectTrade(text: string): string | null {
  const t = text.toLowerCase()
  if (/\b(hvac|ac|a\/c|air|cool|cooling|heat|furnace)\b/.test(t)) return 'HVAC'
  if (/\b(plumb|pipe|leak|drain|water heater|sewer)\b/.test(t)) return 'plumbing'
  if (/\b(electr|outlet|panel|wiring|breaker)\b/.test(t)) return 'electrical'
  if (/\b(roof)\b/.test(t)) return 'roofing'
  if (/\b(pest|termite)\b/.test(t)) return 'pest control'
  if (/\b(landscape|lawn|yard)\b/.test(t)) return 'landscaping'
  return null
}

function detectCrewSize(text: string): number | null {
  const t = text.toLowerCase()
  if (/\b(solo|just me|one man|myself|1 man|one-man)\b/.test(t)) return 1
  const m = t.match(/\b(\d{1,2})\b/)
  if (m) {
    const n = parseInt(m[1], 10)
    if (n >= 1 && n <= 99) return n
  }
  return null
}

function detectPain(text: string): string | null {
  const t = text.toLowerCase()
  if (/\b(miss|after.?hours|nights?|weekends?|overflow|voicemail)\b/.test(t)) return 'missed calls'
  if (/\b(review|google|stars?|rating|reputation)\b/.test(t)) return 'reviews'
  if (/\b(website|chat|visitor|leads?|convert|form)\b/.test(t)) return 'website leads'
  if (/\b(all|everything|bundle|full)\b/.test(t)) return 'all three'
  return null
}

function detectIntent(text: string): 'pricing' | 'hipaa' | 'hello' | 'restart' | null {
  const t = text.toLowerCase()
  if (/\b(start over|reset|restart|new chat)\b/.test(t)) return 'restart'
  if (/\b(hello|hi|hey|howdy)\b/.test(t)) return 'hello'
  if (/\b(hipaa|hippa|compliance|zero data|zdr|regulated|healthcare)\b/.test(t)) return 'hipaa'
  if (/\b(price|pricing|cost|how much)\b/.test(t)) return 'pricing'
  return null
}

const AVG_JOB: Record<string, number> = {
  HVAC: 500,
  plumbing: 450,
  electrical: 400,
}

function buildAssessment(mem: ChatMemory): string {
  const crew = mem.crewSize || 3
  const avg = AVG_JOB[mem.trade || ''] || 425
  const missedPerWeek = crew * 3
  const weeklyLost = Math.round(missedPerWeek * avg * 0.5)
  const monthlyLost = weeklyLost * 4

  const solo = crew === 1
  const crewLabel = solo ? 'solo operator' : `${crew}-tech crew`

  return `Quick math on your ${mem.trade || 'service'} business as a ${crewLabel}: you're likely missing around ${missedPerWeek} calls a week after hours. At ~$${avg} average job and a 50% close rate, that's roughly $${weeklyLost.toLocaleString()}/week — over $${monthlyLost.toLocaleString()}/month — going to whoever picks up first.${solo ? " As a solo operator every one of those hurts." : ""} That's exactly what Vox fixes. Want to see which package fits?`
}

export function advanceReceptionist(
  input: string,
  step: ChatStep,
  memory: ChatMemory,
): { reply: string; step: ChatStep; memory: ChatMemory; chips: string[] } {
  const t = input.trim()
  const lower = t.toLowerCase()
  let nextMem = { ...memory }

  const completeChips = ['Tell me more', 'Start over']
  const idleChips = ['Missed after-hours calls', 'Need more Google reviews', 'Website visitors not converting', 'Tell me about the bundle']

  if (detectIntent(t) === 'restart' || lower === 'start over') {
    return {
      reply: "Fresh start. I help contractors stop losing jobs to missed calls, dead website forms, and forgotten review asks. What's the biggest pain right now?",
      step: 'idle',
      memory: {},
      chips: idleChips,
    }
  }

  if (step === 'complete') {
    if (/\b(tell|more|package|pricing|price)\b/.test(lower)) {
      return {
        reply: "Reviews ~$300–$500/mo for automated Google review texts. Receptionist ~$500–$800/mo for AI website chat. Voice ~$800–$1,500/mo for 24/7 AI phone answering. Or bundle all three for $1,500/mo — less than a part-time hire. All month-to-month, no contracts. Gabe will reach out to get you set up.",
        step: 'complete',
        memory: nextMem,
        chips: completeChips,
      }
    }
    return {
      reply: "You're all set — Gabe will follow up shortly. Tap Start over for a new conversation.",
      step: 'complete',
      memory: nextMem,
      chips: completeChips,
    }
  }

  const intent = detectIntent(t)

  if (intent === 'hello') {
    return {
      reply: "Hey! I'm the AI Receptionist for Vox.chat. I help HVAC, plumbing, and electrical contractors stop losing jobs to missed calls, dead forms, and forgotten review asks. What's the biggest pain right now?",
      step: 'idle',
      memory: {},
      chips: idleChips,
    }
  }

  if (intent === 'pricing') {
    return {
      reply: "Reviews ~$300–$500/mo. Receptionist ~$500–$800/mo. Voice ~$800–$1,500/mo. Bundle all three for $1,500/mo — that's less than a part-time hire. Month-to-month, no contracts. What trade are you in? I can give you a quick revenue estimate.",
      step: 'qualify_trade',
      memory: {},
      chips: ['HVAC', 'Plumbing', 'Electrical'],
    }
  }

  if (intent === 'hipaa') {
    return {
      reply: "We offer compliance add-ons for regulated industries. HIPAA Compliance is $2,500/mo — includes a BAA, encrypted call handling, and annual compliance review. Zero Data Retention is $1,500/mo — no transcripts or recordings stored. Both together (Compliance Bundle) for $3,500/mo, saving $500. All month-to-month. What trade are you in?",
      step: 'qualify_trade',
      memory: {},
      chips: ['HVAC', 'Plumbing', 'Electrical', 'Healthcare'],
    }
  }

  if (step === 'idle') {
    const pain = detectPain(t)
    const trade = detectTrade(t)
    if (pain) nextMem.pain = pain
    if (trade) {
      nextMem.trade = trade
      return {
        reply: `${trade} — great. How big is your crew? Solo operator or how many techs?`,
        step: 'qualify_crew',
        memory: nextMem,
        chips: ['Solo', '3–5 techs', '10+'],
      }
    }
    if (pain) {
      return {
        reply: `${pain === 'all three' ? 'The full stack' : pain.charAt(0).toUpperCase() + pain.slice(1)} — that's exactly what we solve. What trade are you in?`,
        step: 'qualify_trade',
        memory: nextMem,
        chips: ['HVAC', 'Plumbing', 'Electrical'],
      }
    }
    return {
      reply: "Got it. What trade are you in — HVAC, plumbing, electrical, or something else?",
      step: 'qualify_trade',
      memory: nextMem,
      chips: ['HVAC', 'Plumbing', 'Electrical'],
    }
  }

  if (step === 'qualify_trade') {
    const trade = detectTrade(t) || (t.length > 1 ? t : null)
    if (!trade) {
      return {
        reply: "What trade — HVAC, plumbing, electrical?",
        step: 'qualify_trade',
        memory: nextMem,
        chips: ['HVAC', 'Plumbing', 'Electrical'],
      }
    }
    nextMem.trade = trade
    const crew = detectCrewSize(t)
    if (crew) {
      nextMem.crewSize = crew
      return {
        reply: `${trade}, ${crew === 1 ? 'solo' : crew + ' techs'} — got it. What's the biggest pain: missed after-hours calls, not enough Google reviews, or website visitors not converting?`,
        step: 'qualify_pain',
        memory: nextMem,
        chips: ['Missed calls', 'Need reviews', 'Website leads', 'All of it'],
      }
    }
    return {
      reply: `${trade} — nice. How big is your crew? Solo or how many techs?`,
      step: 'qualify_crew',
      memory: nextMem,
      chips: ['Solo', '3–5 techs', '10+'],
    }
  }

  if (step === 'qualify_crew') {
    const crew = detectCrewSize(t)
    if (!crew) {
      if (/\b(small|few|couple)\b/.test(lower)) nextMem.crewSize = 3
      else if (/\b(big|large|lots)\b/.test(lower)) nextMem.crewSize = 12
      else {
        return {
          reply: "Roughly how many techs — just you, or a crew?",
          step: 'qualify_crew',
          memory: nextMem,
          chips: ['Solo', '3–5', '10+'],
        }
      }
    } else {
      nextMem.crewSize = crew
    }
    return {
      reply: `${nextMem.crewSize === 1 ? 'Solo' : nextMem.crewSize + ' techs'} — respect. What's the biggest pain right now: missed after-hours calls, not enough Google reviews, or website visitors not converting?`,
      step: 'qualify_pain',
      memory: nextMem,
      chips: ['Missed calls', 'Need reviews', 'Website leads', 'All of it'],
    }
  }

  if (step === 'qualify_pain') {
    const pain = detectPain(t) || (t.length > 1 ? t : null)
    if (!pain) {
      return {
        reply: "What bugs you most — missed calls, reviews, or website leads?",
        step: 'qualify_pain',
        memory: nextMem,
        chips: ['Missed calls', 'Reviews', 'Website leads'],
      }
    }
    nextMem.pain = pain
    const assessment = buildAssessment(nextMem)
    return {
      reply: assessment,
      step: 'assessment',
      memory: nextMem,
      chips: ['Yes, show packages', 'What does it cost?'],
    }
  }

  if (step === 'assessment') {
    const recommended = nextMem.pain === 'reviews' ? 'Reviews at ~$400/mo'
      : nextMem.pain === 'website leads' ? 'Receptionist at ~$650/mo'
      : nextMem.pain === 'missed calls' ? 'Voice at ~$1,100/mo'
      : 'the Bundle at $1,500/mo'
    return {
      reply: `Based on what you told me, I'd start with ${recommended}. The bundle gets you all three for $1,500/mo — less than a part-time hire. Month-to-month, no contracts, $0 setup. Drop your name and best phone and Gabe will reach out today.`,
      step: 'collect_name',
      memory: nextMem,
      chips: [],
    }
  }

  if (step === 'collect_name') {
    const phone = extractPhone(t)
    if (phone) {
      nextMem.phone = phone
      nextMem.name = t.replace(phone, '').replace(/[^\w\s]/g, '').trim() || 'there'
      return {
        reply: `Got it — Gabe will text ${nextMem.phone} shortly to get you set up. ${nextMem.trade ? `Your ${nextMem.trade} business is about to stop losing money to missed calls.` : "You're about to stop losing money to missed calls."} Anything else?`,
        step: 'complete',
        memory: nextMem,
        chips: completeChips,
      }
    }
    nextMem.name = t
    return {
      reply: `Thanks ${nextMem.name}. What's the best phone number to reach you?`,
      step: 'collect_phone',
      memory: nextMem,
      chips: ['(209) 555-0147'],
    }
  }

  if (step === 'collect_phone') {
    const phone = extractPhone(t)
    if (!phone && t.replace(/\D/g, '').length < 7) {
      return {
        reply: "I need a callback number so Gabe can follow up. Example: (209) 555-0147",
        step: 'collect_phone',
        memory: nextMem,
        chips: ['(209) 555-0147'],
      }
    }
    nextMem.phone = phone || t
    return {
      reply: `Perfect — Gabe will reach out to ${nextMem.phone} today. ${nextMem.trade ? `Your ${nextMem.trade} business is about to stop losing money to missed calls.` : "You're about to stop losing money to missed calls."} Anything else?`,
      step: 'complete',
      memory: nextMem,
      chips: completeChips,
    }
  }

  if (t.length > 2) {
    return {
      reply: "I can help with that. Are you dealing with missed calls, not enough reviews, or website visitors not converting?",
      step: 'idle',
      memory: {},
      chips: idleChips,
    }
  }

  return {
    reply: "I help contractors stop losing jobs. Tap a topic or tell me what's going on with your business.",
    step: 'idle',
    memory: {},
    chips: idleChips,
  }
}
