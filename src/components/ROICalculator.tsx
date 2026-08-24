import { useState } from 'react'

type Trade = 'hvac' | 'plumbing' | 'electrical' | 'general' | 'other'

const TRADES: { value: Trade; label: string; avgJob: number }[] = [
  { value: 'hvac', label: 'HVAC', avgJob: 500 },
  { value: 'plumbing', label: 'Plumbing', avgJob: 600 },
  { value: 'electrical', label: 'Electrical', avgJob: 450 },
  { value: 'general', label: 'General Contractor', avgJob: 400 },
  { value: 'other', label: 'Other', avgJob: 400 },
]

const VOX_VOICE_MONTHLY = 595
const HOURS_PER_MONTH = 720

function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export function MissedCallCalculator() {
  const [trade, setTrade] = useState<Trade>('hvac')
  const [avgJob, setAvgJob] = useState(500)
  const [missedPerWeek, setMissedPerWeek] = useState(5)

  const monthlyLost = Math.round(missedPerWeek * avgJob * 0.5 * 4)
  const annualLost = monthlyLost * 12
  const roiMultiple = monthlyLost > 0 ? Math.round((monthlyLost / VOX_VOICE_MONTHLY) * 10) / 10 : 0

  function onTradeChange(value: Trade) {
    setTrade(value)
    const t = TRADES.find((t) => t.value === value)
    if (t) setAvgJob(t.avgJob)
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Missed Call Calculator
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
          Plug in your numbers and see how much revenue is walking out the door every month.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-5">
          <div>
            <label htmlFor="roi-trade" className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-2">
              Your trade
            </label>
            <select
              id="roi-trade"
              className="vox-select w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors"
              value={trade}
              onChange={(e) => onTradeChange(e.target.value as Trade)}
            >
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="roi-job" className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-2">
              Average job value
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm">$</span>
              <input
                id="roi-job"
                type="number"
                min={50}
                max={10000}
                className="w-full pl-8 pr-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors"
                value={avgJob}
                onChange={(e) => setAvgJob(Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-3">
              Missed calls per week
            </label>
            <div className="flex items-center gap-4">
              <button
                aria-label="Decrease missed calls"
                className="w-10 h-10 rounded-lg border border-input flex items-center justify-center text-foreground hover:border-voice/40 transition-colors"
                onClick={() => setMissedPerWeek(Math.max(1, missedPerWeek - 1))}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M5 12h14" />
                </svg>
              </button>
              <span className="font-serif text-3xl font-bold text-foreground tabular-nums w-12 text-center">
                {missedPerWeek}
              </span>
              <button
                aria-label="Increase missed calls"
                className="w-10 h-10 rounded-lg border border-input flex items-center justify-center text-foreground hover:border-voice/40 transition-colors"
                onClick={() => setMissedPerWeek(Math.min(30, missedPerWeek + 1))}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4" aria-live="polite">
          <div className="rounded-2xl border p-6 shadow-sm vox-slideup" style={{
            borderColor: 'color-mix(in srgb, var(--color-voice) 30%, transparent)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-voice) 6%, var(--card)) 0%, var(--card) 100%)',
          }}>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-1">Lost per month</div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-voice">${fmt(monthlyLost)}</div>
            <div className="text-xs text-muted-foreground/50 mt-1">at 50% close rate</div>
          </div>

          <div className="rounded-2xl border p-6 shadow-sm vox-slideup" style={{
            borderColor: 'color-mix(in srgb, var(--color-review) 30%, transparent)',
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-review) 6%, var(--card)) 0%, var(--card) 100%)',
          }}>
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-1">Lost per year</div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-review">${fmt(annualLost)}</div>
            <div className="text-xs text-muted-foreground/50 mt-1">going to competitors</div>
          </div>

          {monthlyLost > VOX_VOICE_MONTHLY && (
            <div className="rounded-2xl border p-6 shadow-sm vox-slideup" style={{
              borderColor: 'color-mix(in srgb, var(--color-primary) 30%, transparent)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 6%, var(--card)) 0%, var(--card) 100%)',
            }}>
              <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/40 mb-1">Return on Vox Voice</div>
              <div className="font-serif text-3xl sm:text-4xl font-bold text-primary">{roiMultiple}x</div>
              <div className="text-xs text-muted-foreground/50 mt-1">${fmt(monthlyLost)}/mo recovered vs ${fmt(VOX_VOICE_MONTHLY)}/mo cost</div>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground/30">Sources: ServiceTitan Industry Report, BrightLocal Consumer Survey, Marchex Research</p>
    </div>
  )
}

export function HourlyCostComparison() {
  const cards = [
    {
      name: 'Vox Voice',
      hourly: `$${(VOX_VOICE_MONTHLY / HOURS_PER_MONTH).toFixed(2)}/hr`,
      monthly: '$595/mo',
      coverage: '24/7/365',
      features: 'AI qualification, instant alerts, call recording',
      color: 'var(--color-voice)',
      badge: 'Best value',
    },
    {
      name: 'Vox Receptionist',
      hourly: '$0.76/hr',
      monthly: '$295/mo',
      coverage: '24/7/365',
      features: 'Chat qualification, lead capture, FAQ automation',
      color: 'var(--color-chat)',
    },
    {
      name: 'Full-time receptionist',
      hourly: '$18–25/hr',
      monthly: '$3,120–4,330/mo',
      coverage: '8 hrs/day, 5 days/week',
      features: 'No after-hours, PTO, benefits overhead',
    },
    {
      name: 'Answering service',
      hourly: '$2–5/hr',
      monthly: '$200–500/mo',
      coverage: 'Limited hours',
      features: 'No AI qualification, message relay only',
    },
  ]

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Hourly Cost Comparison
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">
          What it actually costs per hour to keep your phone answered — Vox vs the alternatives.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => {
          const isVox = !!c.color
          return (
            <div
              key={c.name}
              className="relative flex flex-col rounded-2xl border p-6 shadow-sm"
              style={{
                borderColor: isVox ? `color-mix(in srgb, ${c.color} 30%, transparent)` : undefined,
                background: isVox
                  ? `linear-gradient(135deg, color-mix(in srgb, ${c.color} 6%, var(--card)) 0%, var(--card) 100%)`
                  : undefined,
              }}
            >
              {c.badge && (
                <span
                  className="absolute top-4 right-4 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{
                    background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                    color: c.color,
                  }}
                >
                  {c.badge}
                </span>
              )}
              <div className="font-serif text-2xl sm:text-3xl font-bold mb-1" style={{ color: c.color || 'var(--muted-foreground)' }}>
                {c.hourly}
              </div>
              <div className="text-sm font-semibold text-foreground">{c.name}</div>
              <div className="mb-4" />
              <div className="mt-auto pt-4 border-t border-border/20 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {c.coverage}
                </div>
                <div className="flex items-start gap-2 text-xs text-muted-foreground/60">
                  <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {c.features}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center font-mono text-xs text-muted-foreground/60">
        Vox costs less per hour than a morning coffee — and never takes a sick day.
      </p>
    </div>
  )
}
