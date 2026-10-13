/** Pure scheduling helpers for the voice agent. No network. */

const WEEKDAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
}

export function timeZone() {
  return process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Los_Angeles'
}

export function jobMinutes() {
  const n = Number(process.env.VOICE_JOB_MINUTES || 90)
  return Number.isFinite(n) && n >= 30 && n <= 480 ? n : 90
}

export function zonedParts(date, tz) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  })
  const bag = {}
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== 'literal') bag[p.type] = p.value
  }
  if (bag.hour === '24') bag.hour = '00'
  const weekday = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[bag.weekday]
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    weekday,
  }
}

/** Wall-clock time in `tz` → UTC Date. */
export function zonedTimeToUtc(y, m, d, hh, mm, tz) {
  let utc = Date.UTC(y, m - 1, d, hh, mm, 0)
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(new Date(utc), tz)
    const got = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute)
    const want = Date.UTC(y, m - 1, d, hh, mm)
    const diff = got - want
    if (diff === 0) break
    utc -= diff
  }
  return new Date(utc)
}

function addDays(y, m, d, days) {
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return { year: dt.getUTCFullYear(), month: dt.getUTCMonth() + 1, day: dt.getUTCDate() }
}

/** Mon–Fri 7–18, Sat 8–14, Sun closed. Override with VOICE_HOURS_JSON like {"1":[7,18]}. */
export function hoursForWeekday(weekday) {
  const raw = process.env.VOICE_HOURS_JSON
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      const row = parsed[String(weekday)]
      if (!row) return null
      return { open: Number(row[0]), close: Number(row[1]) }
    } catch {
      /* default hours */
    }
  }
  if (weekday >= 1 && weekday <= 5) return { open: 7, close: 18 }
  if (weekday === 6) return { open: 8, close: 14 }
  return null
}

export function isOpenAt(start, durationMin, tz) {
  const p = zonedParts(start, tz)
  const hours = hoursForWeekday(p.weekday)
  if (!hours) return false
  const end = new Date(start.getTime() + durationMin * 60000)
  const pe = zonedParts(end, tz)
  if (pe.year !== p.year || pe.month !== p.month || pe.day !== p.day) return false
  const startMin = p.hour * 60 + p.minute
  const endMin = pe.hour * 60 + pe.minute
  return startMin >= hours.open * 60 && endMin <= hours.close * 60
}

function parseClock(match) {
  let hh = Number(match[1])
  const mm = Number(match[2] || 0)
  const ap = (match[3] || '').toLowerCase()
  if (ap === 'pm' && hh < 12) hh += 12
  if (ap === 'am' && hh === 12) hh = 0
  if (hh > 23 || mm > 59) return null
  return { hh, mm }
}

export function parseRequestedStart(text, now = new Date(), tz = timeZone()) {
  const s = String(text || '').trim()
  if (!s) return { ok: false, error: 'needs_time', message: 'Ask what day and time works.' }

  if (/^\d{4}-\d{2}-\d{2}T/.test(s) || /[zZ]|[+-]\d{2}:\d{2}$/.test(s)) {
    const d = new Date(s)
    if (!Number.isNaN(d.getTime())) return { ok: true, start: d }
  }

  const dated = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
  if (dated) {
    const clock = parseClock([null, dated[4], dated[5], dated[6]])
    if (!clock) return { ok: false, error: 'bad_time', message: 'That time did not parse. Ask again.' }
    return {
      ok: true,
      start: zonedTimeToUtc(Number(dated[1]), Number(dated[2]), Number(dated[3]), clock.hh, clock.mm, tz),
    }
  }

  const time =
    s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) || s.match(/\b(\d{1,2}):(\d{2})\b/)
  if (!time) {
    return { ok: false, error: 'needs_time', message: 'Ask for a time of day, like 2pm or 10:30am.' }
  }
  const clock = parseClock(time)
  if (!clock) return { ok: false, error: 'bad_time', message: 'That time did not parse. Ask again.' }

  const today = zonedParts(now, tz)
  let delta = null
  if (/\btomorrow\b/i.test(s)) delta = 1
  else if (/\btoday\b/i.test(s)) delta = 0
  else {
    const wd = s.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i)
    if (wd) {
      const target = WEEKDAYS[wd[1].toLowerCase()]
      delta = (target - today.weekday + 7) % 7
      const startMin = clock.hh * 60 + clock.mm
      const nowMin = today.hour * 60 + today.minute
      if (delta === 0 && startMin <= nowMin + 15) delta = 7
    }
  }
  if (delta == null) {
    return { ok: false, error: 'needs_day', message: 'Ask which day — today, tomorrow, or a weekday.' }
  }

  const date = addDays(today.year, today.month, today.day, delta)
  const start = zonedTimeToUtc(date.year, date.month, date.day, clock.hh, clock.mm, tz)
  if (start.getTime() < now.getTime() - 5 * 60000) {
    return { ok: false, error: 'in_past', message: 'That time already passed. Ask for a later slot.' }
  }
  return { ok: true, start }
}

export function overlaps(start, end, busy) {
  return busy.some((b) => start < b.end && end > b.start)
}

export function suggestSlots({ now, tz, durationMin, busy, count = 3, days = 10 }) {
  const slots = []
  const today = zonedParts(now, tz)
  for (let d = 0; d < days && slots.length < count; d++) {
    const date = addDays(today.year, today.month, today.day, d)
    const probe = zonedTimeToUtc(date.year, date.month, date.day, 12, 0, tz)
    const weekday = zonedParts(probe, tz).weekday
    const hours = hoursForWeekday(weekday)
    if (!hours) continue
    for (let min = hours.open * 60; min + durationMin <= hours.close * 60; min += 30) {
      const hh = Math.floor(min / 60)
      const mm = min % 60
      const start = zonedTimeToUtc(date.year, date.month, date.day, hh, mm, tz)
      if (start.getTime() < now.getTime() + 30 * 60000) continue
      const end = new Date(start.getTime() + durationMin * 60000)
      if (overlaps(start, end, busy)) continue
      slots.push(start)
      if (slots.length >= count) break
    }
  }
  return slots
}

export function formatWhen(date, tz) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

export function formatDay(date, tz) {
  const p = zonedParts(date, tz)
  const mm = String(p.month).padStart(2, '0')
  const dd = String(p.day).padStart(2, '0')
  return `${p.year}-${mm}-${dd}`
}

const HARD_EMERGENCY =
  /\b(gas leak|smell(?:s|ing)? gas|carbon monoxide|smoke|on fire|flood(?:ing|ed)?|sewage|burst pipe|spark(?:ing|s)?|electrical fire)\b/i
const SOFT_EMERGENCY = /\b(no heat|no a\/?c|no air|not cooling|not heating)\b/i
const URGENT_WORD = /\b(emergency|urgent|right away|right now|cannot wait|can't wait)\b/i

export function looksLikeEmergency({ emergency, issue, transcript }) {
  const flag = String(emergency == null ? '' : emergency).toLowerCase()
  if (emergency === true || flag === 'true' || flag === 'yes') return true
  const blob = `${issue || ''}\n${transcript || ''}`
  if (HARD_EMERGENCY.test(blob)) return true
  if (URGENT_WORD.test(blob) && SOFT_EMERGENCY.test(blob)) return true
  return false
}
