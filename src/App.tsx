import { useState, useEffect, useRef } from 'react'
import './index.css'
import { advanceReceptionist, type ChatMemory, type ChatStep } from './receptionist/localFlow'
import { TypingDots } from './TypingDots'
import LiveReceptionistWidget from './LiveReceptionistWidget'

function HeroWaves() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 1400 500" fill="none" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
        <path d="M0 280 Q150 220 300 260 T600 240 T900 270 T1200 230 T1400 260" stroke="var(--voice)" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" fill="none" />
        <path d="M0 260 Q180 300 350 250 T700 280 T1000 240 T1300 270 T1400 250" stroke="var(--chat)" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" fill="none" />
        <path d="M0 300 Q200 250 400 290 T750 260 T1050 290 T1350 250 T1400 280" stroke="var(--review)" strokeWidth="1.5" strokeLinecap="round" opacity="0.12" fill="none" />
      </svg>
    </div>
  )
}

function useTheme() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('vox-theme')
    if (stored) return stored === 'dark'
    return document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('vox-theme', dark ? 'dark' : 'light')
  }, [dark])

  return { dark, toggle: () => setDark((d) => !d) }
}

function Nav() {
  const { dark, toggle } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <a href="#" className="inline-flex items-center gap-1.5" aria-label="Vox.chat">
          <span className="w-2.5 h-2.5 rounded-full bg-voice" />
          <span className="w-2.5 h-2.5 rounded-full bg-chat" />
          <span className="w-2.5 h-2.5 rounded-full bg-review" />
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#demos" className="hover:text-foreground transition-colors">Demos</a>
          <a href="/blog.html" className="hover:text-foreground transition-colors">Blog</a>
          <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors"
          >
            Get started
          </a>
          <button
            type="button"
            role="switch"
            aria-checked={dark}
            onClick={toggle}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors ${
              dark
                ? 'bg-primary border-primary'
                : 'bg-muted border-border'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                dark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl px-5 py-4 space-y-1">
          <a href="#services" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Services</a>
          <a href="#demos" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Demos</a>
          <a href="#contact" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">Get started</a>
        </div>
      )}
    </nav>
  )
}

function Hero() {
  return (
    <section className="relative pt-32 sm:pt-44 pb-24 sm:pb-36 px-5 bg-gradient-to-t from-primary/10 via-primary/5 to-transparent overflow-hidden">
      <HeroWaves />
      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left — headline */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border border-input bg-muted text-muted-foreground text-[11px] sm:text-xs font-mono mb-6 mx-auto lg:mx-0 max-w-[calc(100%-0.5rem)]">
              <span className="block w-1.5 h-1.5 shrink-0 rounded-full bg-primary animate-pulse" aria-hidden="true" />
              <span className="leading-none text-left">AI automation for HVAC, plumbing &amp; electrical</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
              Never miss a call, lead,<br />
              <span className="text-primary">or review.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg leading-relaxed mb-8 mx-auto lg:mx-0">
              AI answers your phone, captures website leads, and gets you more Google reviews — 24/7. Built for contractors.
            </p>
            <a
              href="#demos"
              className="inline-flex items-center justify-center lg:justify-start gap-2 text-sm font-medium text-primary hover:text-primary/70 transition-colors"
            >
              See it in action
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Right — contact form */}
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-7 shadow-lg">
            <h2 className="text-lg font-semibold mb-1">Book a free consultation</h2>
            <p className="text-sm text-muted-foreground mb-5">No contracts. Cancel anytime.</p>
            <form
              action="https://formspree.io/f/mwvdpgay"
              method="POST"
              className="space-y-3"
            >
              <input type="hidden" name="site" value="vox.chat" />
              <input type="hidden" name="source" value="hero" />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                />
                <input
                  type="text"
                  name="business"
                  placeholder="Business name"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="trade"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors appearance-none"
                >
                  <option value="">Your trade</option>
                  <option value="hvac">HVAC</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="other">Other</option>
                </select>
                <select
                  name="service"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors appearance-none"
                >
                  <option value="">Which service?</option>
                  <option value="voice">AI Phone Agent</option>
                  <option value="chat">AI Receptionist</option>
                  <option value="reviews">AI Review Agent</option>
                  <option value="bundle">All Three</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/80 transition-colors"
              >
                Get started free
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    {
      eyebrow: 'Step 1',
      title: 'We learn your trade',
      description: 'Tell us your services, service area, and how you want calls handled. HVAC installs, emergency plumbing, panel upgrades — we tailor the AI to your exact workflow.',
      detail: ['Custom greeting & tone', 'Trade-specific FAQ training', 'Your calendar & booking rules'],
    },
    {
      eyebrow: 'Step 2',
      title: 'Your AI goes live',
      description: 'Your AI agent starts answering calls, chatting with website visitors, and following up on reviews — even at 2 AM when a pipe bursts.',
      detail: ['Phone forwarding setup', 'AI Receptionist activated', 'Review automation activated'],
    },
    {
      eyebrow: 'Step 3',
      title: 'You grow while we handle the rest',
      description: 'Focus on the job site. Your AI handles every call, books every appointment, and builds your 5-star reputation around the clock.',
      detail: ['Real-time notifications', 'Monthly performance reports', 'Ongoing script optimization'],
    },
  ]

  return (
    <section className="py-24 sm:py-32 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl lg:max-w-none lg:text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">How it works</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Easy setup. No tech skills needed.
          </h2>
        </div>
        <div className="space-y-16 sm:space-y-20">
          {steps.map((s, i) => (
            <div key={i} className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${i % 2 === 1 ? 'lg:direction-rtl' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <span className="font-mono text-xs uppercase tracking-widest text-primary">{s.eyebrow}</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mt-2 mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
              <div className={`rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-shadow duration-300 hover:shadow-[0_0_25px_-5px_var(--primary)] hover:border-primary/30 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <ul className="space-y-4">
                  {s.detail.map((d) => (
                    <li key={d} className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-sm text-foreground">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const colorMap = {
  voice: {
    dot: 'bg-voice',
    badge: 'bg-voice/8',
    text: 'text-voice',
    check: 'text-voice/70',
    tabActive: 'bg-voice/12 text-voice border-voice/30',
  },
  chat: {
    dot: 'bg-chat',
    badge: 'bg-chat/8',
    text: 'text-chat',
    check: 'text-chat/70',
    tabActive: 'bg-chat/12 text-chat border-chat/30',
  },
  review: {
    dot: 'bg-review',
    badge: 'bg-review/8',
    text: 'text-review',
    check: 'text-review/70',
    tabActive: 'bg-review/12 text-review border-review/30',
  },
}

const services = [
  {
    name: 'Vox Voice',
    tagline: 'AI Phone Agent',
    color: 'voice' as const,
    popular: false,
    features: [
      'AI answers your business phone 24/7',
      'Qualifies callers and collects details',
      'Books appointments to your calendar',
      'Instant text/email notification',
      'Call recordings and transcripts',
    ],
  },
  {
    name: 'Vox Receptionist',
    tagline: 'AI Receptionist',
    color: 'chat' as const,
    popular: true,
    features: [
      'Greets and qualifies every visitor',
      'Custom-trained on your services & pricing',
      'Collects name, phone, service needed',
      'Answers FAQs automatically',
      'Books appointments to your calendar',
    ],
  },
  {
    name: 'Vox Reviews',
    tagline: 'AI Review Agent',
    color: 'review' as const,
    popular: false,
    features: [
      'Automated text 2hrs after job',
      'Follow-up at 48hrs if no response',
      'Direct link to Google review page',
      'Negative review alert to owner',
      'Monthly review growth report',
    ],
  },
]

function Services() {
  return (
    <section id="services" className="py-24 sm:py-32 px-5 bg-muted">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Services</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Three tools. One subscription.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Purpose-built for HVAC techs, plumbers, and electricians — the trades where one missed call means hundreds lost.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
          {services.map((s) => {
            const c = colorMap[s.color]
            return (
              <div
                key={s.name}
                className={`relative flex flex-col rounded-2xl border bg-card transition-all ${
                  s.popular
                    ? 'border-primary shadow-lg sm:scale-[1.03] sm:-my-2'
                    : 'border-border/60 shadow-sm hover:shadow-md hover:border-border'
                }`}
                style={s.popular ? { boxShadow: '0 0 30px -5px var(--primary)' } : undefined}
              >
                {s.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase shadow-md whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`p-5 sm:p-6 ${s.popular ? 'pt-8' : ''}`}>
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md ${c.badge} mb-3`}>
                    <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                    <span className={`font-mono text-xs ${c.text}`}>{s.tagline}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{s.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">Custom-built for your business</p>
                  <div className="border-t border-border/60 pt-5">
                    <ul className="space-y-3">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <svg className={`w-4 h-4 mt-0.5 shrink-0 ${c.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-auto px-5 sm:px-6 pb-5 sm:pb-6 space-y-2">
                  <a
                    href={`#demo-${s.color === 'voice' ? 'voice' : s.color === 'chat' ? 'chat' : 'review'}`}
                    className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      s.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                        : 'border border-input text-foreground hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    Try the demo
                  </a>
                  <a
                    href="tel:+12099967102"
                    className="flex w-full items-center justify-center gap-2 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    or call now
                  </a>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-12 text-center">
          <a
            href="#contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-input text-muted-foreground font-medium text-sm hover:border-primary/40 hover:text-foreground transition-colors"
          >
            Fill out the form
          </a>
        </div>
      </div>
    </section>
  )
}

function VoiceDemo() {
  const messages = [
    { from: 'system' as const, text: 'Incoming call from (209) 555-0147...' },
    { from: 'ai' as const, text: "Good afternoon, Valley Air Pros, this is the AI phone agent. How can I help you today?" },
    { from: 'caller' as const, text: "Yeah, my AC stopped blowing cold air about an hour ago. It's 102 out here in Manteca." },
    { from: 'ai' as const, text: "I'm sorry to hear that — let me get you taken care of. Can I get your name?" },
    { from: 'caller' as const, text: 'Mike Torres.' },
    { from: 'ai' as const, text: "Thanks Mike. And what's the best address for the service call?" },
    { from: 'caller' as const, text: '1247 Oakwood Drive, Manteca.' },
    { from: 'ai' as const, text: 'Got it. I have availability tomorrow morning between 8 and 10 AM, or this afternoon between 4 and 6. Which works better?' },
    { from: 'caller' as const, text: 'This afternoon for sure.' },
    { from: 'ai' as const, text: "Done — you're booked for today between 4 and 6 PM. You'll get a confirmation text shortly. Anything else I can help with?" },
    { from: 'system' as const, text: '✓ Appointment booked → SMS sent to contractor → Calendar updated' },
  ]

  const [visibleCount, setVisibleCount] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [done, setDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [visibleCount])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function stopPlayback() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setPlaying(false)
  }

  function startPlayback() {
    stopPlayback()
    setVisibleCount(0)
    setDone(false)
    setPlaying(true)
    let count = 0
    timerRef.current = setInterval(() => {
      count += 1
      setVisibleCount(count)
      if (count >= messages.length) {
        stopPlayback()
        setDone(true)
      }
    }, 1400)
  }

  function reset() {
    stopPlayback()
    setVisibleCount(0)
    setDone(false)
  }

  const statusLabel =
    playing && visibleCount > 0
      ? messages[visibleCount - 1]?.from === 'ai'
        ? 'Agent speaking'
        : messages[visibleCount - 1]?.from === 'caller'
          ? 'Caller speaking'
          : 'Connecting…'
      : done
        ? 'Call complete'
        : 'Ready to play'

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2 h-2 rounded-full shrink-0 ${playing ? 'bg-voice animate-pulse' : done ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground truncate">{statusLabel}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!playing && !done && (
            <button
              type="button"
              onClick={startPlayback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-voice text-white text-xs font-semibold hover:bg-voice/90 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              Play call
            </button>
          )}
          {playing && (
            <button
              type="button"
              onClick={stopPlayback}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pause
            </button>
          )}
          {(done || visibleCount > 0) && !playing && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Replay
            </button>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1">
        {visibleCount === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-full bg-voice/10 border border-voice/20 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-voice" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-foreground mb-1">After-hours AC emergency</p>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              Constrained demo — a real Manteca-style call. Agent qualifies, books, and notifies the contractor in under 2 minutes.
            </p>
          </div>
        )}
        {messages.slice(0, visibleCount).map((m, i) => (
          <div key={i} className={`flex ${m.from === 'caller' ? 'justify-end' : 'justify-start'} vox-fadein`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm ${
                m.from === 'system'
                  ? 'bg-primary/10 text-primary font-mono text-xs border border-primary/20'
                  : m.from === 'ai'
                    ? 'bg-voice/10 text-foreground border border-voice/20'
                    : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {m.from !== 'system' && (
                <span className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${m.from === 'ai' ? 'text-voice' : 'text-muted-foreground/50'}`}>
                  {m.from === 'ai' ? 'Phone agent' : 'Caller'}
                </span>
              )}
              {m.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


function ReceptionistDemo() {
  const [messages, setMessages] = useState<Array<{ from: 'receptionist' | 'user'; text: string }>>([
    {
      from: 'receptionist',
      text: "Hi — I'm the AI Receptionist for Valley Air Pros. I can schedule a repair, rough out a quote, or confirm service areas. What do you need?",
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [step, setStep] = useState<ChatStep>('idle')
  const [memory, setMemory] = useState<ChatMemory>({})
  const [chips, setChips] = useState(['Schedule a repair', 'Get a quote', 'What areas do you serve?', 'My AC died — 95336'])
  const scrollRef = useRef<HTMLDivElement>(null)
  const stepRef = useRef(step)
  const memoryRef = useRef(memory)

  useEffect(() => {
    stepRef.current = step
  }, [step])
  useEffect(() => {
    memoryRef.current = memory
  }, [memory])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing) return

    if (/^start over$/i.test(trimmed)) {
      setMessages((m) => [...m, { from: 'user', text: trimmed }])
      setInput('')
      setTyping(true)
      setTimeout(() => {
        setTyping(false)
        setMessages([
          { from: 'user', text: trimmed },
          {
            from: 'receptionist',
            text: "Fresh start. I can schedule a repair, rough out a quote, or confirm service areas — what do you need?",
          },
        ])
        setStep('idle')
        setMemory({})
        setChips(['Schedule a repair', 'Get a quote', 'What areas do you serve?'])
      }, 400)
      return
    }

    setMessages((m) => [...m, { from: 'user', text: trimmed }])
    setInput('')
    setTyping(true)

    const delay = 550 + Math.min(trimmed.length * 8, 600)
    setTimeout(() => {
      if (/^book another$/i.test(trimmed) || (/yes.*book/i.test(trimmed) && stepRef.current === 'complete')) {
        const result = advanceReceptionist('schedule a repair', 'idle', {})
        setTyping(false)
        setMessages((m) => [...m, { from: 'receptionist', text: result.reply }])
        setStep(result.step)
        setMemory(result.memory)
        setChips(result.chips)
        return
      }

      const result = advanceReceptionist(trimmed, stepRef.current, memoryRef.current)
      setTyping(false)
      setMessages((m) => [...m, { from: 'receptionist', text: result.reply }])
      setStep(result.step)
      setMemory(result.memory)
      setChips(result.chips)
    }, delay)
  }

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border/50">
        <span className="w-2 h-2 rounded-full bg-chat" />
        <span className="font-mono text-[11px] uppercase tracking-wider text-chat">AI Receptionist</span>
        <span className="text-[11px] text-muted-foreground/60">· guided demo</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm ${
                m.from === 'receptionist'
                  ? 'bg-chat/10 text-foreground border border-chat/20'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              {m.from === 'receptionist' && (
                <span className="block text-[10px] font-mono uppercase tracking-wider mb-1 text-chat">Receptionist</span>
              )}
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-lg bg-chat/10 border border-chat/20">
              <TypingDots />
            </div>
          </div>
        )}
      </div>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {chips.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => send(opt)}
              disabled={typing}
              className="px-2.5 py-1 rounded-md border border-chat/30 text-chat text-[11px] font-medium hover:bg-chat/10 transition-colors disabled:opacity-40"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the receptionist…"
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:border-chat/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="px-3.5 py-2 rounded-lg bg-chat text-white text-sm font-semibold hover:bg-chat/90 disabled:opacity-40 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  )
}

type ReviewMsg = {
  from: 'system' | 'customer' | 'owner' | 'status'
  text: string
}

function ReviewTyping({ side = 'left' }: { side?: 'left' | 'right' }) {
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'} vox-fadein`}>
      <div
        className={`px-4 py-3 rounded-2xl border ${
          side === 'right'
            ? 'bg-muted border-border rounded-br-md'
            : 'bg-review/10 border-review/20 rounded-bl-md'
        }`}
      >
        <TypingDots />
      </div>
    </div>
  )
}

function ReviewDemo() {
  type Phase = 'job' | 'thread'
  const [phase, setPhase] = useState<Phase>('job')
  const [messages, setMessages] = useState<ReviewMsg[]>([])
  const [typing, setTyping] = useState<'left' | 'right' | null>(null)
  const [awaitingRating, setAwaitingRating] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing, awaitingRating, done])

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
    }
  }, [])

  function clearTimers() {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function later(ms: number, fn: () => void) {
    const id = setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  function reset() {
    clearTimers()
    setPhase('job')
    setMessages([])
    setTyping(null)
    setAwaitingRating(false)
    setRating(null)
    setDone(false)
  }

  function startThread() {
    clearTimers()
    setPhase('thread')
    setMessages([])
    setRating(null)
    setDone(false)
    setAwaitingRating(false)
    setTyping('left')

    later(900, () => {
      setTyping(null)
      setMessages([
        {
          from: 'status',
          text: 'Job complete · Mike Torres · AC repair · Manteca · +2 hrs',
        },
      ])
      setTyping('left')
    })

    later(1800, () => {
      setTyping(null)
      setMessages((m) => [
        ...m,
        {
          from: 'system',
          text: 'Hi Mike! How was your service with Valley Air Pros today? Reply with a number 1–5.',
        },
      ])
      setAwaitingRating(true)
    })
  }

  function pickRating(n: number) {
    if (!awaitingRating || typing) return
    setAwaitingRating(false)
    setRating(n)
    const positive = n >= 4

    setMessages((m) => [...m, { from: 'customer', text: String(n) }])
    setTyping('left')

    if (positive) {
      later(1100, () => {
        setTyping(null)
        setMessages((m) => [
          ...m,
          {
            from: 'system',
            text: 'Thanks Mike — glad it went well. Mind a 30-second Google review? One-tap link: https://g.page/r/valley-air-demo',
          },
        ])
        setTyping('right')
      })
      later(2400, () => {
        setTyping(null)
        setMessages((m) => [
          ...m,
          { from: 'customer', text: 'Done ⭐⭐⭐⭐⭐' },
        ])
        setTyping('left')
      })
      later(3400, () => {
        setTyping(null)
        setMessages((m) => [
          ...m,
          {
            from: 'status',
            text: '5-star review on Google · 48hr follow-up skipped · map pack signal +1',
          },
        ])
        setDone(true)
      })
    } else {
      later(1100, () => {
        setTyping(null)
        setMessages((m) => [
          ...m,
          {
            from: 'system',
            text: "Sorry it wasn't a 5. We're not sending a public review link — the owner will reach out shortly.",
          },
        ])
        setTyping('left')
      })
      later(2400, () => {
        setTyping(null)
        setMessages((m) => [
          ...m,
          {
            from: 'owner',
            text: `Owner alert: Mike Torres rated ${n}/5 after AC repair in Manteca. Call before this becomes a public review.`,
          },
        ])
        setTyping('left')
      })
      later(3600, () => {
        setTyping(null)
        setMessages((m) => [
          ...m,
          {
            from: 'status',
            text: 'Google link blocked · private recovery path · public profile protected',
          },
        ])
        setDone(true)
      })
    }
  }

  return (
    <div className="flex flex-col h-[420px]">
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-review" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-review">Review flow PoC</span>
          <span className="text-[11px] text-muted-foreground/60">· SMS thread</span>
        </div>
        {phase !== 'job' && (
          <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Reset
          </button>
        )}
      </div>

      {phase === 'job' && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="rounded-xl border border-border/60 bg-muted/40 p-4 mb-5">
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Completed job</p>
            <p className="text-sm font-semibold text-foreground">Mike Torres · AC repair</p>
            <p className="text-xs text-muted-foreground mt-1">1247 Oakwood Dr, Manteca · marked done 2:00 PM</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            Two hours later the system opens an SMS thread — satisfaction first, Google link only if they score high.
          </p>
          <button
            type="button"
            onClick={startThread}
            className="w-full py-2.5 rounded-lg bg-review/15 border border-review/30 text-review text-sm font-semibold hover:bg-review/25 transition-colors"
          >
            Play SMS flow →
          </button>
        </div>
      )}

      {phase === 'thread' && (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
            {messages.map((m, i) => {
              if (m.from === 'status') {
                return (
                  <div key={i} className="flex justify-center vox-fadein">
                    <span className="max-w-[95%] px-3 py-1.5 rounded-full bg-muted/80 border border-border/50 font-mono text-[10px] text-muted-foreground text-center leading-snug">
                      {m.text}
                    </span>
                  </div>
                )
              }
              const isCustomer = m.from === 'customer'
              const isOwner = m.from === 'owner'
              return (
                <div key={i} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'} vox-fadein`}>
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isCustomer
                        ? 'bg-muted text-foreground border border-border rounded-br-md'
                        : isOwner
                          ? 'bg-destructive/10 text-foreground border border-destructive/25 rounded-bl-md'
                          : 'bg-review/10 text-foreground border border-review/20 rounded-bl-md'
                    }`}
                  >
                    <span
                      className={`block text-[10px] font-mono uppercase tracking-wider mb-1 ${
                        isCustomer ? 'text-muted-foreground/50' : isOwner ? 'text-destructive/80' : 'text-review'
                      }`}
                    >
                      {isCustomer ? 'Mike (customer)' : isOwner ? 'Owner SMS' : 'Review agent'}
                    </span>
                    {m.text}
                  </div>
                </div>
              )
            })}
            {typing && <ReviewTyping side={typing} />}
            {done && rating !== null && (
              <div className="flex justify-center vox-fadein pt-1">
                <span
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border ${
                    rating >= 4
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}
                >
                  {rating >= 4 ? 'Positive path complete' : 'Negative path complete — public profile protected'}
                </span>
              </div>
            )}
          </div>

          {awaitingRating && (
            <div className="pt-1 border-t border-border/40">
              <p className="text-[11px] text-muted-foreground text-center mb-2">Customer replies with a score</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => pickRating(n)}
                    className="w-10 h-10 rounded-xl border border-review/30 bg-card text-sm font-bold text-foreground hover:border-review hover:bg-review/10 active:scale-95 transition-all"
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 text-center mt-2">1–3 private · 4–5 Google link</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Demos() {
  const [activeTab, setActiveTab] = useState<'voice' | 'chat' | 'review'>('chat')

  const tabs = [
    { id: 'chat' as const, label: 'AI Receptionist', desc: 'Guided demo for Valley Air Pros — schedules, quotes, and service areas through a full booking path.' },
    { id: 'review' as const, label: 'AI Review Agent', desc: 'Walk the real branch: satisfaction score → Google link or private owner alert. No blind review spam.' },
    { id: 'voice' as const, label: 'AI Phone Agent', desc: 'Call playback — qualify, book, notify. Live telephony comes with the real proof-of-concept build.' },
  ]

  useEffect(() => {
    function applyHash() {
      const h = window.location.hash.replace('#', '')
      if (h === 'demo-voice' || h === 'demos-voice') setActiveTab('voice')
      else if (h === 'demo-chat' || h === 'demos-chat') setActiveTab('chat')
      else if (h === 'demo-review' || h === 'demos-review') setActiveTab('review')
      if (h === 'demos' || h.startsWith('demo-') || h.startsWith('demos-')) {
        document.getElementById('demos')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    return () => window.removeEventListener('hashchange', applyHash)
  }, [])

  function selectTab(id: 'voice' | 'chat' | 'review') {
    setActiveTab(id)
    const next = `demo-${id}`
    if (window.location.hash.replace('#', '') !== next) {
      history.replaceState(null, '', `#${next}`)
    }
  }

  const activeDesc = tabs.find((t) => t.id === activeTab)!.desc

  return (
    <section id="demos" className="py-24 sm:py-32 px-5 bg-muted scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Interactive demos</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Proof, not slides
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {activeDesc}
            </p>
            <div className="flex flex-col gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTab(t.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all border text-left ${
                    activeTab === t.id
                      ? colorMap[t.id].tabActive
                      : 'text-muted-foreground/50 hover:text-muted-foreground border-transparent'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-md">
            {activeTab === 'voice' && <VoiceDemo />}
            {activeTab === 'chat' && <ReceptionistDemo />}
            {activeTab === 'review' && <ReviewDemo />}
          </div>
        </div>
      </div>
    </section>
  )
}

function ROI() {
  const stats = [
    { value: '27%', label: 'Calls missed', sub: 'by the average HVAC contractor' },
    { value: '85%', label: 'Call a competitor', sub: 'when no one picks up' },
    { value: '$3,800', label: 'Lost per month', sub: 'in missed call revenue' },
  ]

  return (
    <section className="py-24 sm:py-32 px-5">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Results</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            The cost of staying offline
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Every missed call is a job that goes to your competitor. Whether it's a burst pipe at midnight, a dead AC in July, or a panel upgrade quote — if no one answers, they move on.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-8 pt-10 pb-8 rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="font-serif text-4xl sm:text-5xl font-bold text-primary mb-2">{s.value}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{s.label}</div>
              <div className="text-xs text-muted-foreground/50">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BuiltFor() {
  const trades = [
    { name: 'HVAC Contractors', stat: '$3,800/mo in missed calls', desc: 'Peak summer demand means 27% of calls go unanswered. Your AI picks up every one.' },
    { name: 'Plumbers', stat: '48% of emergencies after hours', desc: 'Burst pipes don\'t wait until morning. Your AI answers at 2 AM the same way it does at 2 PM.' },
    { name: 'Electricians', stat: '78% close rate for first responder', desc: 'Panel upgrades, EV chargers, outages — whoever answers first wins the bid.' },
  ]

  return (
    <section className="py-24 sm:py-32 px-5 bg-muted">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Built for your trade</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            We know your business
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Not a generic AI receptionist. Trained on the language, workflows, and urgency of the trades.
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {trades.map((t) => (
            <div key={t.name} className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-1">{t.name}</h3>
              <p className="font-mono text-xs text-primary mb-3">{t.stat}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground/60 mt-8">
          Also serving roofers, landscapers, pest control, and other home service pros.
        </p>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="py-24 sm:py-32 px-5">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Get started</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Ready to automate your business?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Free consultation for HVAC, plumbing, and electrical contractors. No contracts. Cancel anytime.
            </p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</span>
                <span>Tell us about your business</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">2</span>
                <span>We build your custom AI agent</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">3</span>
                <span>Go live — your AI handles the rest</span>
              </div>
            </div>
          </div>
          <form
            action="https://formspree.io/f/mwvdpgay"
            method="POST"
            className="space-y-4 rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm"
          >
            <input type="hidden" name="site" value="vox.chat" />
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
              />
              <input
                type="text"
                name="business"
                placeholder="Business name"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
              />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <select
                name="trade"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors appearance-none"
              >
                <option value="">Your trade</option>
                <option value="hvac">HVAC / Air Conditioning</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="other">Other</option>
              </select>
              <select
                name="service"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:border-ring transition-colors appearance-none"
              >
                <option value="">Which service?</option>
                <option value="voice">AI Phone Agent</option>
                <option value="chat">AI Receptionist</option>
                <option value="reviews">AI Review Agent</option>
                <option value="bundle">All Three</option>
              </select>
            </div>
            <textarea
              name="message"
              rows={4}
              placeholder="Tell us about your business (optional)"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors resize-none"
            />
            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/80 transition-colors"
            >
              Book free consultation
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}



function Footer() {
  return (
    <footer className="border-t border-border py-10 px-6 sm:px-10 pb-20 sm:pb-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-8">
        <div className="flex flex-col items-center sm:items-start gap-2.5">
          <div className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-voice" />
            <span className="w-2.5 h-2.5 rounded-full bg-chat" />
            <span className="w-2.5 h-2.5 rounded-full bg-review" />
          </div>
          <div className="flex items-center gap-2.5">
            <a href="mailto:email@vox.chat" aria-label="Email us" className="text-muted-foreground/50 hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
            <a
              href="https://x.com/voxdotchat"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Vox.chat on X"
              className="text-muted-foreground/50 hover:text-foreground transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
            </a>
            <span className="font-mono text-xs text-muted-foreground/50">&copy; {new Date().getFullYear()} Vox.chat</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground/50">
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#demos" className="hover:text-foreground transition-colors">Demos</a>
          <a href="/blog.html" className="hover:text-foreground transition-colors">Blog</a>
          <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          <a href="/legal.html" className="hover:text-foreground transition-colors">Legal</a>
        </div>
      </div>
    </footer>
  )
}

function MobileBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto gap-2">
        {/* Showroom — not a product dock */}
        <a
          href="#demos"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 min-h-11 text-muted-foreground/40 active:text-muted-foreground transition-colors"
          aria-label="See demos"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
          <span className="text-[10px] font-medium text-muted-foreground/30">Demos</span>
        </a>

        {/* Primary conversion */}
        <a
          href="tel:+12099967102"
          className="flex items-center justify-center w-14 h-14 -mt-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
          aria-label="Call Vox.chat"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
          </svg>
        </a>

        {/* Structured lead — power/start icon */}
        <a
          href="#contact"
          className="flex flex-1 flex-col items-center justify-center gap-0.5 min-h-11 text-muted-foreground/40 active:text-muted-foreground transition-colors"
          aria-label="Get started"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v9" />
            <path d="M5.64 6.64a8 8 0 1012.72 0" />
          </svg>
          <span className="text-[10px] font-medium text-muted-foreground/30">Start</span>
        </a>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Services />
      <HowItWorks />
      <Demos />
      <ROI />
      <BuiltFor />
      <Contact />
      <Footer />
      <MobileBottomBar />
      <LiveReceptionistWidget />
    </>
  )
}
