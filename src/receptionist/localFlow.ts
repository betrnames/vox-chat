/** Deterministic multi-step fallback when the SpaceXAI API is unavailable. */

export type ChatStep =
  | 'idle'
  | 'schedule_service'
  | 'schedule_phone'
  | 'schedule_slot'
  | 'quote_type'
  | 'quote_zip'
  | 'complete'

export type ChatMemory = {
  service?: string
  phone?: string
  slot?: string
  quoteType?: string
  zip?: string
}

function extractPhone(text: string): string | null {
  const m = text.match(/\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})\b/)
  return m ? m[1].replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3') : null
}

function extractZip(text: string): string | null {
  const m = text.match(/\b(9\d{4})\b/)
  return m ? m[1] : null
}

function detectService(text: string): string | null {
  const t = text.toLowerCase()
  if (/\b(ac|a\/c|air|cool|cooling|hvac)\b/.test(t)) return 'AC / cooling'
  if (/\b(heat|furnace|heater|heating)\b/.test(t)) return 'heating'
  if (/\b(plumb|pipe|leak|drain|water heater)\b/.test(t)) return 'plumbing'
  if (/\b(electr|outlet|panel|wiring|breaker)\b/.test(t)) return 'electrical'
  if (/\b(duct)\b/.test(t)) return 'ductwork'
  return null
}

function detectSlot(text: string): string | null {
  const t = text.toLowerCase()
  if (/\b(morning|am)\b/.test(t)) return 'tomorrow morning (8–10 AM)'
  if (/\b(afternoon|pm)\b/.test(t)) return 'tomorrow afternoon (1–4 PM)'
  if (/\b(today|asap|emergency|soon)\b/.test(t)) return 'today (same-day window)'
  if (/\b(evening|after work)\b/.test(t)) return 'tomorrow evening (4–6 PM)'
  return null
}

function detectQuoteType(text: string): string | null {
  const t = text.toLowerCase()
  if (/\b(install|replacement|new unit)\b/.test(t)) return 'install / replacement'
  if (/\b(repair|fix|broken)\b/.test(t)) return 'repair'
  if (/\b(maintenance|tune|checkup|service plan)\b/.test(t)) return 'maintenance'
  return null
}

function detectIntent(text: string): 'schedule' | 'quote' | 'area' | 'hello' | 'restart' | null {
  const t = text.toLowerCase()
  if (/\b(start over|reset|restart|new chat)\b/.test(t)) return 'restart'
  if (/\b(hello|hi|hey|howdy)\b/.test(t)) return 'hello'
  if (/\b(quote|price|cost|how much|estimate|pricing)\b/.test(t)) return 'quote'
  if (/\b(area|serve|service area|where do you|coverage)\b/.test(t)) return 'area'
  if (/\b(schedule|book|appointment|repair|fix|broken|not working|died|emergency)\b/.test(t)) return 'schedule'
  if (detectService(text)) return 'schedule'
  return null
}

export function advanceReceptionist(
  input: string,
  step: ChatStep,
  memory: ChatMemory,
): { reply: string; step: ChatStep; memory: ChatMemory; chips: string[] } {
  const t = input.trim()
  const lower = t.toLowerCase()
  let nextMem = { ...memory }

  const completeChips = ['Book another', 'Start over']
  const idleChips = ['Schedule a repair', 'Get a quote', 'What areas do you serve?']

  if (detectIntent(t) === 'restart' || lower === 'start over') {
    return {
      reply: "Fresh start. I can schedule a repair, rough out a quote, or confirm where we serve — what do you need?",
      step: 'idle',
      memory: {},
      chips: idleChips,
    }
  }

  if (step === 'complete') {
    if (/\b(book|schedule|another|repair)\b/.test(lower)) {
      return {
        reply: 'Happy to book another. What needs service — AC, heating, plumbing, or electrical?',
        step: 'schedule_service',
        memory: {},
        chips: ['AC not cooling', 'Furnace issue', 'Plumbing leak', 'Electrical'],
      }
    }
    return {
      reply: "You're all set. Tap Start over for a new run, or ask anything else about service.",
      step: 'complete',
      memory: nextMem,
      chips: completeChips,
    }
  }

  if (step === 'schedule_service') {
    const service = detectService(t) || (t.length > 1 ? t : null)
    if (!service) {
      return {
        reply: 'What needs service — AC/cooling, heating, plumbing, or electrical?',
        step: 'schedule_service',
        memory: nextMem,
        chips: ['AC not cooling', 'Heating', 'Plumbing', 'Electrical'],
      }
    }
    nextMem.service = service
    const phone = extractPhone(t)
    if (phone) {
      nextMem.phone = phone
      return {
        reply: `Got it — ${service}. Phone ${phone} saved. Morning or afternoon work better for the tech visit?`,
        step: 'schedule_slot',
        memory: nextMem,
        chips: ['Morning', 'Afternoon', 'Today if possible'],
      }
    }
    return {
      reply: `${service} — noted. What's the best phone number to reach you?`,
      step: 'schedule_phone',
      memory: nextMem,
      chips: ['(209) 555-0147', 'Text me instead'],
    }
  }

  if (step === 'schedule_phone') {
    if (/\b(text|sms)\b/.test(lower)) {
      nextMem.phone = 'SMS opt-in'
    } else {
      const phone = extractPhone(t)
      if (!phone && t.replace(/\D/g, '').length < 7) {
        return {
          reply: 'I need a callback number so the tech can confirm. Example: (209) 555-0147',
          step: 'schedule_phone',
          memory: nextMem,
          chips: ['(209) 555-0147'],
        }
      }
      nextMem.phone = phone || t
    }
    return {
      reply: `Thanks — ${nextMem.phone}. Last step: morning, afternoon, or same-day if we have a window?`,
      step: 'schedule_slot',
      memory: nextMem,
      chips: ['Morning 8–10', 'Afternoon 1–4', 'Today ASAP'],
    }
  }

  if (step === 'schedule_slot') {
    if (/just the range/i.test(t)) {
      return {
        reply: 'No problem — keep that range for planning. Come back anytime to book a visit.',
        step: 'complete',
        memory: nextMem,
        chips: completeChips,
      }
    }
    const slot = detectSlot(t) || t
    nextMem.slot = slot
    return {
      reply: `Booked. ${nextMem.service || 'Service'} for ${nextMem.slot}. We'll text ${nextMem.phone || 'you'} a confirmation and notify the contractor. You're on the schedule.`,
      step: 'complete',
      memory: nextMem,
      chips: completeChips,
    }
  }

  if (step === 'quote_type') {
    const qt = detectQuoteType(t) || detectService(t) || t
    nextMem.quoteType = qt
    const zip = extractZip(t)
    if (zip) {
      nextMem.zip = zip
      return {
        reply: `Rough range for ${qt} in ${zip}: $180–$450 diagnostic/repair visits; installs vary by system. Want me to book a tech to quote on-site?`,
        step: 'complete',
        memory: nextMem,
        chips: ['Yes, book a visit', 'Start over'],
      }
    }
    return {
      reply: `${qt} — good. What's your zip code so I can price for your area?`,
      step: 'quote_zip',
      memory: nextMem,
      chips: ['95336', '95380', '95350'],
    }
  }

  if (step === 'quote_zip') {
    const zip = extractZip(t) || t.replace(/\D/g, '').slice(0, 5) || t
    nextMem.zip = zip
    return {
      reply: `For ${nextMem.quoteType || 'service'} near ${zip}: typical repair visits run $180–$450; full installs are quoted on-site. I can book a free estimate — morning or afternoon?`,
      step: 'schedule_slot',
      memory: {
        ...nextMem,
        service: nextMem.quoteType || 'estimate visit',
        phone: nextMem.phone || 'on file at booking',
      },
      chips: ['Morning', 'Afternoon', 'Just the range is fine'],
    }
  }

  const intent = detectIntent(t)

  if (intent === 'hello') {
    return {
      reply: "Hey! I'm the AI Receptionist for Valley Air Pros. I can schedule repairs, rough out quotes, or confirm service areas — what do you need?",
      step: 'idle',
      memory: {},
      chips: idleChips,
    }
  }

  if (intent === 'area') {
    return {
      reply: 'We cover the 209 corridor — Manteca, Stockton, Tracy, Modesto, Turlock, Lathrop, Ripon, and nearby. Same-day often available. Want to schedule something?',
      step: 'idle',
      memory: {},
      chips: ['Schedule a repair', 'Get a quote', 'Start over'],
    }
  }

  if (intent === 'quote') {
    return {
      reply: 'Happy to ballpark pricing. Is this an install/replacement, a repair, or maintenance?',
      step: 'quote_type',
      memory: {},
      chips: ['Repair', 'New install', 'Maintenance'],
    }
  }

  if (intent === 'schedule') {
    const service = detectService(t)
    const zip = extractZip(t)
    const phone = extractPhone(t)
    if (service) nextMem.service = service
    if (zip) nextMem.zip = zip
    if (phone) nextMem.phone = phone

    if (service && phone) {
      return {
        reply: `${service} — got it. Number ${phone} saved${zip ? ` · ${zip}` : ''}. Morning or afternoon for the tech?`,
        step: 'schedule_slot',
        memory: nextMem,
        chips: ['Morning', 'Afternoon', 'Today ASAP'],
      }
    }
    if (service) {
      return {
        reply: `${service} in ${zip || 'your area'} — I can book that. What's the best phone number?`,
        step: 'schedule_phone',
        memory: nextMem,
        chips: ['(209) 555-0147'],
      }
    }
    return {
      reply: 'I can get that on the calendar. What needs service — AC, heating, plumbing, or electrical?',
      step: 'schedule_service',
      memory: nextMem,
      chips: ['AC not cooling', 'Heating', 'Plumbing', 'Electrical'],
    }
  }

  if (t.length > 2) {
    return {
      reply: "I can help with that. Let's book it — what needs service (AC, heating, plumbing, electrical), or want a price range first?",
      step: 'idle',
      memory: {},
      chips: ['Schedule a repair', 'Get a quote', 'Service areas'],
    }
  }

  return {
    reply: 'I can schedule a repair, rough out a quote, or list service areas. Tap a suggestion or type what you need.',
    step: 'idle',
    memory: {},
    chips: idleChips,
  }
}
