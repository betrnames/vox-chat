import { useState, useEffect, useRef } from 'react'
import './index.css'

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

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Typing">
      <span className="w-1.5 h-1.5 rounded-full bg-voice vox-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-chat vox-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-review vox-bounce" style={{ animationDelay: '300ms' }} />
    </span>
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
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {dark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <a
            href="#contact"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors"
          >
            Get started
          </a>
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
          <a href="/blog.html" className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Blog</a>
          <a href="/faq.html" className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">FAQ</a>
          <a href="/legal.html" className="block px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Legal</a>
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-input bg-muted text-muted-foreground text-xs font-mono mb-6 mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              AI automation for HVAC, plumbing &amp; electrical
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
              Your business.<br />
              <span className="text-primary">Never offline.</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg leading-relaxed mb-8 mx-auto lg:mx-0">
              AI voice agents, AI chatbots, and AI review agents that automate your phones, your website, and your reviews — so you never miss a customer again.
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
                  <option value="chat">AI Chatbot</option>
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
      detail: ['Phone forwarding setup', 'Chat widget installed', 'Review automation activated'],
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
    name: 'Vox Chat',
    tagline: 'AI Chatbot',
    color: 'chat' as const,
    popular: true,
    features: [
      'Smart widget on your website',
      'Custom-trained on your services & pricing',
      'Collects name, phone, service needed',
      'Answers FAQs automatically',
      'Schedules appointments',
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
                <div className="mt-auto px-5 sm:px-6 pb-5 sm:pb-6">
                  <a
                    href="tel:+12099967102"
                    className={`flex w-full items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                      s.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                        : 'border border-input text-foreground hover:border-primary/40 hover:text-primary'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call now
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
    { from: 'system', text: 'Incoming call from (209) 555-0147...' },
    { from: 'ai', text: "Good afternoon, Valley Air Pros, this is Vox. How can I help you today?" },
    { from: 'caller', text: "Yeah, my AC stopped blowing cold air about an hour ago. It's 102 out here in Manteca." },
    { from: 'ai', text: "I'm sorry to hear that — let me get you taken care of. Can I get your name?" },
    { from: 'caller', text: "Mike Torres." },
    { from: 'ai', text: "Thanks Mike. And what's the best address for the service call?" },
    { from: 'caller', text: "1247 Oakwood Drive, Manteca." },
    { from: 'ai', text: "Got it. I have availability tomorrow morning between 8 and 10 AM, or this afternoon between 4 and 6. Which works better?" },
    { from: 'caller', text: "This afternoon for sure." },
    { from: 'ai', text: "Done — you're booked for today between 4 and 6 PM. You'll get a confirmation text shortly. Anything else I can help with?" },
    { from: 'system', text: '✓ Appointment booked → SMS sent to contractor → Calendar updated' },
  ]

  const [visibleCount, setVisibleCount] = useState(3)

  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
      {messages.slice(0, visibleCount).map((m, i) => (
        <div
          key={i}
          className={`flex ${m.from === 'caller' ? 'justify-end' : 'justify-start'}`}
        >
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
                {m.from === 'ai' ? 'Vox Agent' : 'Caller'}
              </span>
            )}
            {m.text}
          </div>
        </div>
      ))}
      {visibleCount < messages.length && (
        <button
          onClick={() => setVisibleCount((c) => Math.min(c + 2, messages.length))}
          className="w-full py-2 text-xs font-mono text-primary hover:text-primary/70 transition-colors"
        >
          Continue conversation →
        </button>
      )}
    </div>
  )
}

function ChatDemo() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hi! 👋 I'm the AI assistant for Valley Air Pros. How can I help?" },
  ])
  const [showOptions, setShowOptions] = useState(true)
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const options = [
    'Schedule a repair',
    'Get a quote',
    'What areas do you serve?',
  ]

  const responses: Record<string, string> = {
    'Schedule a repair': "I'd be happy to schedule that. What type of system needs repair — AC, heating, or ductwork? And what's the best phone number to reach you?",
    'Get a quote': "Sure! For an accurate quote I'll need: 1) Type of service (install, repair, maintenance), 2) System type and age if known, 3) Your zip code. What are we working with?",
    'What areas do you serve?': "We serve the entire Central Valley — Manteca, Stockton, Tracy, Modesto, Turlock, and surrounding areas. Same-day service available in most zones. Need to schedule something?",
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing])

  function handleOption(opt: string) {
    setMessages((m) => [...m, { from: 'user', text: opt }])
    setShowOptions(false)
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { from: 'bot', text: responses[opt] }])
      setShowOptions(true)
    }, 1200)
  }

  return (
    <div className="flex flex-col h-[420px]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-lg text-sm ${
                m.from === 'bot'
                  ? 'bg-chat/10 text-foreground border border-chat/20'
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
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
      {showOptions && (
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOption(opt)}
              className="px-3 py-1.5 rounded-md border border-chat/30 text-chat text-xs font-medium hover:bg-chat/10 transition-colors"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewDemo() {
  const steps = [
    { time: '2:00 PM', label: 'Job Complete', desc: 'Technician marks job done in the field', icon: '✓', active: true },
    { time: '4:00 PM', label: 'First Text Sent', desc: '"Hi Mike! How was your service today? Tap to leave a review →"', icon: '📱', active: true },
    { time: '4:02 PM', label: 'Link Opened', desc: 'Customer clicks direct link to Google review page', icon: '🔗', active: true },
    { time: '4:05 PM', label: '5-Star Review', desc: '"Fast service, AC works great. Mike was professional."', icon: '⭐', active: true },
    { time: '—', label: '48hr Follow-up', desc: 'Skipped — review already received', icon: '↩', active: false },
  ]

  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-3 bottom-3 w-px bg-input" />
      <div className="space-y-6">
        {steps.map((s, i) => (
          <div key={i} className="relative flex gap-4">
            <div className={`absolute left-[-17px] w-3 h-3 rounded-full border-2 ${s.active ? 'border-review bg-review/30' : 'border-input bg-card'}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="font-mono text-xs text-review">{s.time}</span>
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Demos() {
  const [activeTab, setActiveTab] = useState<'voice' | 'chat' | 'review'>('voice')

  const tabs = [
    { id: 'voice' as const, label: 'Voice Agent', desc: 'AI answers calls, qualifies callers, and books appointments — all without you lifting a finger.' },
    { id: 'chat' as const, label: 'Chatbot', desc: 'Your website never sleeps. Visitors get instant answers and appointments booked automatically.' },
    { id: 'review' as const, label: 'Reviews', desc: 'Automated follow-ups turn completed jobs into 5-star reviews on autopilot.' },
  ]

  const activeDesc = tabs.find((t) => t.id === activeTab)!.desc

  return (
    <section id="demos" className="py-24 sm:py-32 px-5 bg-muted">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-12 lg:gap-16 items-start">
          <div className="lg:sticky lg:top-24">
            <p className="font-mono text-xs uppercase tracking-widest text-primary mb-3">Live demos</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              See how it works
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {activeDesc}
            </p>
            <div className="flex flex-col gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
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
            {activeTab === 'chat' && <ChatDemo />}
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
            Not a generic AI receptionist. Vox is trained on the language, workflows, and urgency of the trades.
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
                <option value="chat">AI Chatbot</option>
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
    <footer className="border-t border-border py-10 px-5">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-voice" />
          <span className="w-2.5 h-2.5 rounded-full bg-chat" />
          <span className="w-2.5 h-2.5 rounded-full bg-review" />
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground/50">
          <a href="#services" className="hover:text-foreground transition-colors">Services</a>
          <a href="#demos" className="hover:text-foreground transition-colors">Demos</a>
          <a href="/blog.html" className="hover:text-foreground transition-colors">Blog</a>
          <a href="/faq.html" className="hover:text-foreground transition-colors">FAQ</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
          <a href="/legal.html" className="hover:text-foreground transition-colors">Legal</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="mailto:email@vox.chat" aria-label="Email us" className="text-muted-foreground/50 hover:text-foreground transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
          <span className="font-mono text-xs text-muted-foreground/50">&copy; {new Date().getFullYear()} Vox.chat</span>
        </div>
      </div>
    </footer>
  )
}

function MobileBottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        <a href="mailto:email@vox.chat" className="flex flex-col items-center gap-0.5 text-muted-foreground active:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          <span className="text-[10px] font-medium">Email</span>
        </a>
        <a href="tel:+12099967102" className="flex flex-col items-center gap-0.5 text-primary">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center -mt-4 shadow-lg">
            <svg className="w-5 h-5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium">Call</span>
        </a>
        <a href="#contact" className="flex flex-col items-center gap-0.5 text-muted-foreground active:text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
          <span className="text-[10px] font-medium">Form</span>
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
    </>
  )
}
