import { useMemo, useState } from 'react'
import './index.css'
import ConsentNote from './ConsentNote'

function param(name: string): string {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get(name)?.trim() || ''
}

const fieldClass =
  'w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors'

const labelClass = 'block text-xs font-medium text-muted-foreground mb-1.5'

export default function SetupPage() {
  const submitted = useMemo(() => param('done') === '1' || param('thanks') === '1', [])

  const defaults = useMemo(
    () => ({
      source: param('source') || 'BNI',
      interest: param('interest') || 'Bundle',
      city: param('city') || '',
      name: param('name') || '',
      business: param('business') || '',
    }),
    [],
  )

  const [source, setSource] = useState(defaults.source)
  const [interest, setInterest] = useState(defaults.interest)

  const nextUrl = useMemo(() => {
    if (typeof window === 'undefined') return 'https://vox.chat/setup?done=1'
    const base = `${window.location.origin}${window.location.pathname.replace(/\/$/, '') || '/setup'}`
    return `${base}?done=1`
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5" aria-label="Vox.chat">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </div>
        </div>
      </header>

      <main className="px-5 py-10 sm:py-14">
        <div className="max-w-xl mx-auto">
          {!submitted ? (
            <>
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary mb-3">Private setup</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">Start setup</h1>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-5">
                You were sent this link after we agreed to move forward. Takes about 2 minutes. Gabe configures your
                fixed package from these answers — invite-only, not in the site menu.
              </p>

              <div className="mb-8 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3.5 text-sm leading-relaxed">
                <p className="font-semibold text-foreground mb-1">Payment first — then setup</p>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Work starts only after first-month payment clears (Stripe link, Zelle, or Venmo — whatever Gabe
                  sent you). No Net 30. No custom estimates, proposals, or RFPs. Fixed packages only — what you
                  pick below is the full scope.
                </p>
              </div>

              <form
                action="https://formspree.io/f/mwvdpgay"
                method="POST"
                className="space-y-4 rounded-2xl border border-border/60 bg-card p-5 sm:p-7 shadow-md"
              >
                <input type="hidden" name="site" value="vox.chat" />
                <input type="hidden" name="form" value="start-setup" />
                <input type="hidden" name="_subject" value="Vox Start Setup — new intake" />
                <input type="hidden" name="_next" value={nextUrl} />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="name">
                      Your name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      defaultValue={defaults.name}
                      className={fieldClass}
                      placeholder="Gabe"
                    />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="business">
                      Business name *
                    </label>
                    <input
                      id="business"
                      name="business"
                      required
                      defaultValue={defaults.business}
                      className={fieldClass}
                      placeholder="Valley Air Pros"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="phone">
                      Best phone *
                    </label>
                    <input id="phone" name="phone" type="tel" required className={fieldClass} placeholder="(209) 555-0147" />
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="email">
                      Email *
                    </label>
                    <input id="email" name="email" type="email" required className={fieldClass} placeholder="you@business.com" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="trade">
                      Trade *
                    </label>
                    <select id="trade" name="trade" required className={fieldClass} defaultValue="">
                      <option value="" disabled>
                        Select…
                      </option>
                      <option value="HVAC">HVAC</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="city">
                      Primary city *
                    </label>
                    <select id="city" name="city" required className={fieldClass} defaultValue={defaults.city || ''}>
                      <option value="" disabled>
                        Select…
                      </option>
                      <option value="Turlock">Turlock</option>
                      <option value="Modesto">Modesto</option>
                      <option value="Manteca">Manteca</option>
                      <option value="Other">Other (Central Valley)</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="source">
                      How we connected *
                    </label>
                    <select
                      id="source"
                      name="source"
                      required
                      className={fieldClass}
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                    >
                      <option value="BNI">BNI</option>
                      <option value="Outbound">Outbound / Gabe reached out</option>
                      <option value="Referral">Referral</option>
                      <option value="Website">Website</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass} htmlFor="interest">
                      Starting package *
                    </label>
                    <select
                      id="interest"
                      name="interest"
                      required
                      className={fieldClass}
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                    >
                      <option value="Bundle">Bundle — all three ($1,500/mo)</option>
                      <option value="Voice">AI Phone Agent</option>
                      <option value="Receptionist">AI Receptionist</option>
                      <option value="Reviews">AI Review Agent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="services">
                    Main services you offer *
                  </label>
                  <textarea
                    id="services"
                    name="services"
                    required
                    rows={3}
                    className={`${fieldClass} resize-none`}
                    placeholder="e.g. AC repair, installs, maintenance — Turlock & Modesto"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="hours">
                    Business hours + after-hours preference *
                  </label>
                  <textarea
                    id="hours"
                    name="hours"
                    required
                    rows={2}
                    className={`${fieldClass} resize-none`}
                    placeholder="e.g. Mon–Fri 8–5; AI answers nights/weekends; emergencies text me"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="calendar">
                    Calendar / scheduling tool
                  </label>
                  <input
                    id="calendar"
                    name="calendar"
                    className={fieldClass}
                    placeholder="Google Calendar, Housecall Pro, Jobber, ServiceTitan, paper…"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="google_review_link">
                    Google review link (if you have it)
                  </label>
                  <input
                    id="google_review_link"
                    name="google_review_link"
                    type="url"
                    className={fieldClass}
                    placeholder="https://g.page/r/…"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="notes">
                    Anything else Gabe should know
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className={`${fieldClass} resize-none`}
                    placeholder="Pricing rules, Spanish callers, emergency definition, preferred start date…"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="payment_method">
                    How you paid / will pay first month *
                  </label>
                  <select id="payment_method" name="payment_method" required className={fieldClass} defaultValue="">
                    <option value="" disabled>
                      Select…
                    </option>
                    <option value="Stripe">Stripe / card link Gabe sent</option>
                    <option value="Zelle">Zelle</option>
                    <option value="Venmo">Venmo</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Other">Other (note below)</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/40 p-4 cursor-pointer">
                  <input
                    type="checkbox"
                    name="terms_fixed_package"
                    value="yes"
                    required
                    className="mt-1 h-4 w-4 shrink-0 rounded border-input accent-[var(--primary)]"
                  />
                  <span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">I agree — fixed package, paid to start. *</span>
                    {' '}
                    This is a fixed monthly package (not a custom project). First month is paid before setup.
                    No Net 30/90, no estimates or RFPs. Included: the package I selected, configured for my
                    services, hours, and notifications. Not included: website redesign, custom software, ads
                    management, or unlimited rewrites. Month-to-month after that; cancel before the next cycle.
                    Material new features = a different package or paid add-on.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors"
                >
                  Submit setup form
                </button>
                <ConsentNote />
                <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
                  Private link for invited leads only. Configuration starts after payment clears.
                </p>
              </form>
            </>
          ) : (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
              <h1 className="font-serif text-2xl font-bold mb-3">Got it — you&apos;re in the queue</h1>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Once first-month payment is confirmed, Gabe configures your package (usually within one business
                day). Watch for a text or email from Vox.chat.
              </p>
              <a href="tel:+12099967102" className="text-sm font-medium text-primary hover:text-primary/70">
                Need something urgent? Call
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
