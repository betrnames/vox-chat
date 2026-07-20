import { useEffect, useRef, useState, type FormEvent } from 'react'
import { TypingDots } from './TypingDots'
import ConsentNote from './ConsentNote'

type Msg = { role: 'user' | 'assistant'; content: string }

const OPENING =
  "Hi — I'm Vox's AI Receptionist. I help HVAC, plumbing, and electrical owners stop losing jobs to missed calls, dead website forms, and forgotten review asks. What's the biggest pain right now?"

const CHIPS = [
  'Missed after-hours calls',
  'Need more Google reviews',
  'Website visitors not converting',
  'Tell me about the bundle',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_MSG = 'Too many messages. Call or text (209) 996-7102 to talk now.'

export type LiveReceptionistWidgetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function BrandDots({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const d = size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'
  return (
    <span className="inline-flex items-center gap-1" aria-hidden="true">
      <span className={`${d} rounded-full bg-voice`} />
      <span className={`${d} rounded-full bg-chat`} />
      <span className={`${d} rounded-full bg-review`} />
    </span>
  )
}

async function chat(
  messages: Msg[],
  visitorEmail: string,
): Promise<{ reply: string; notified?: string[] } | { error: string; code?: string }> {
  try {
    const res = await fetch('/api/receptionist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'live',
        source: 'site-widget',
        visitorEmail,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    const data = (await res.json()) as {
      reply?: string
      notified?: string[]
      error?: string
      fallback?: boolean
      code?: string
    }
    if (res.status === 429 || data.code === 'rate_limit') {
      return { error: data.error || RATE_LIMIT_MSG, code: 'rate_limit' }
    }
    if (!res.ok || !data.reply) {
      return { error: data.error || 'unavailable', code: data.code }
    }
    return { reply: data.reply, notified: data.notified }
  } catch {
    return { error: 'network' }
  }
}

async function probeApi(): Promise<boolean> {
  try {
    const res = await fetch('/api/receptionist')
    if (!res.ok) return false
    const data = (await res.json()) as { ok?: boolean; hasKey?: boolean }
    return Boolean(data.ok && data.hasKey)
  } catch {
    return false
  }
}

function StatusPill({ online, compact = false }: { online: boolean; compact?: boolean }) {
  const color = online ? 'text-emerald-500' : 'text-red-500'
  const dot = online ? 'bg-emerald-500' : 'bg-red-500'
  const label = online ? (compact ? 'Live' : 'Online') : 'Offline'
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider shrink-0 ${color}`}
      title={online ? 'AI Receptionist is available' : 'AI Receptionist is offline'}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${online ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}

export default function LiveReceptionistWidget({ open, onOpenChange }: LiveReceptionistWidgetProps) {
  const [gatePassed, setGatePassed] = useState(false)
  const [gateEmail, setGateEmail] = useState('')
  const [gateError, setGateError] = useState('')
  const [visitorEmail, setVisitorEmail] = useState('')
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [inputLocked, setInputLocked] = useState(false)
  const lockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [online, setOnline] = useState(
    () => (typeof navigator !== 'undefined' ? navigator.onLine : true),
  )
  const [messages, setMessages] = useState<Msg[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  /** Desktop: lift launcher/panel when footer is in view so it doesn't cover footer links */
  const [liftForFooter, setLiftForFooter] = useState(false)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    probeApi().then(setOnline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
      if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => setLiftForFooter(entry.isIntersecting),
      { root: null, rootMargin: '0px', threshold: 0 },
    )
    io.observe(footer)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing, open, gatePassed])

  // Lock body scroll when chat is open on mobile
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  function lockInputFor60s() {
    setInputLocked(true)
    if (lockTimerRef.current) clearTimeout(lockTimerRef.current)
    lockTimerRef.current = setTimeout(() => {
      setInputLocked(false)
      lockTimerRef.current = null
    }, 60_000)
  }

  function startWithEmail(e: FormEvent) {
    e.preventDefault()
    const email = gateEmail.trim().toLowerCase()
    if (!EMAIL_RE.test(email)) {
      setGateError('Enter a valid email to start.')
      return
    }
    setGateError('')
    setVisitorEmail(email)
    setGatePassed(true)
    setMessages([{ role: 'assistant', content: OPENING }])
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing || inputLocked || !gatePassed || !visitorEmail) return

    if (!navigator.onLine) {
      setOnline(false)
      setMessages((m) => [
        ...m,
        { role: 'user', content: trimmed },
        {
          role: 'assistant',
          content:
            "You're offline right now. Call or text (209) 996-7102 or use the contact form when you're back online.",
        },
      ])
      setInput('')
      return
    }

    const next: Msg[] = [...messages, { role: 'user', content: trimmed }]
    setMessages(next)
    setInput('')
    setTyping(true)

    const result = await chat(next, visitorEmail)
    setTyping(false)

    if ('error' in result) {
      if (result.code === 'rate_limit') {
        setMessages((m) => [...m, { role: 'assistant', content: result.error || RATE_LIMIT_MSG }])
        lockInputFor60s()
        return
      }
      const billing =
        result.code === 'no_credits' ||
        /credits|billing|console\.x\.ai/i.test(result.error || '')
      if (!billing) setOnline(false)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: billing
            ? "I'm online, but the AI provider account needs credits before I can reply. Gabe can still help — call or text (209) 996-7102 or use the contact form."
            : "I'm having trouble connecting right now. Call or text (209) 996-7102 or use the contact form — Gabe will get back to you fast.",
        },
      ])
      return
    }

    setOnline(true)
    setMessages((m) => [...m, { role: 'assistant', content: result.reply }])
    if (result.notified?.length) setLeadSent(true)
  }

  const controlsDisabled = typing || inputLocked

  return (
    <>
      {/* Desktop floating launcher only — mobile uses bottom bar */}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`hidden sm:flex fixed z-[60] right-6 items-center gap-2.5 rounded-full border border-border/60 bg-background/95 backdrop-blur-xl text-foreground shadow-lg shadow-black/10 dark:shadow-black/40 px-4 py-3 text-sm font-semibold hover:border-primary/40 hover:bg-muted active:scale-[0.98] transition-[bottom,transform] duration-200 ${
          liftForFooter ? 'bottom-36' : 'bottom-6'
        }`}
        aria-expanded={open}
        aria-controls="vox-live-receptionist"
      >
        {open ? (
          <>
            <span className="w-5 h-5 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-xs leading-none">
              ×
            </span>
            <span className="font-medium">Close</span>
          </>
        ) : (
          <>
            <BrandDots size="md" />
            <span className="font-medium">AI Receptionist</span>
            <span className="ml-0.5">
              <StatusPill online={online} compact />
            </span>
          </>
        )}
      </button>

      {/* Mobile backdrop when open */}
      {open && (
        <button
          type="button"
          aria-label="Close receptionist"
          className="sm:hidden fixed inset-0 z-[55] bg-background/60 backdrop-blur-[2px]"
          onClick={() => onOpenChange(false)}
        />
      )}

      {open && (
        <div
          id="vox-live-receptionist"
          className={`fixed z-[60] flex flex-col overflow-hidden bg-card shadow-2xl shadow-black/20 dark:shadow-black/50 border border-border/60
            /* mobile: full width above bottom bar */
            left-0 right-0 bottom-14 top-auto h-[min(78dvh,560px)] rounded-t-2xl border-b-0
            /* desktop: floating card — lift with launcher when footer is visible */
            sm:left-auto sm:right-6 sm:top-auto sm:w-[min(100vw-2rem,380px)] sm:h-[min(70vh,520px)] sm:rounded-2xl sm:border-b transition-[bottom] duration-200 ${
              liftForFooter ? 'sm:bottom-44' : 'sm:bottom-24'
            }`}
          role="dialog"
          aria-label="Vox AI Receptionist"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm shrink-0">
            {/* drag hint on mobile */}
            <div className="sm:hidden absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 rounded-full bg-border" aria-hidden />
            <BrandDots size="md" />
            <div className="min-w-0 flex-1 pt-1 sm:pt-0">
              <p className="text-sm font-semibold text-foreground leading-tight tracking-tight">
                AI Receptionist
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">Vox.chat</p>
            </div>
            {leadSent ? (
              <span className="text-[10px] font-mono uppercase tracking-wider text-primary shrink-0">
                Lead sent
              </span>
            ) : (
              <StatusPill online={online} />
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="sm:hidden p-2 -mr-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close receptionist"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!gatePassed ? (
            <div className="flex-1 flex flex-col justify-center p-5 bg-background/40 min-h-0 overflow-y-auto">
              <p className="text-sm font-semibold text-foreground mb-1">Start the conversation</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Drop your email so we can follow up — then the AI opens. No spam, no contracts.
              </p>
              <form onSubmit={startWithEmail} className="space-y-3">
                <div>
                  <label htmlFor="vox-chat-email" className="sr-only">
                    Email
                  </label>
                  <input
                    id="vox-chat-email"
                    type="email"
                    required
                    autoFocus
                    autoComplete="email"
                    inputMode="email"
                    value={gateEmail}
                    onChange={(e) => {
                      setGateEmail(e.target.value)
                      if (gateError) setGateError('')
                    }}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                  {gateError && <p className="mt-1.5 text-xs text-destructive">{gateError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors"
                >
                  Talk to receptionist
                </button>
                <ConsentNote />
              </form>
              <p className="mt-4 text-[11px] text-muted-foreground/70 font-mono text-center">
                Or call (209) 996-7102
              </p>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain space-y-3 p-3 bg-background/40 min-h-0">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[90%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed ${
                        m.role === 'assistant'
                          ? 'bg-card text-foreground border border-border/60 shadow-sm'
                          : 'bg-primary text-primary-foreground border border-primary'
                      }`}
                    >
                      {m.role === 'assistant' && (
                        <span className="flex items-center gap-1.5 mb-1.5">
                          <BrandDots />
                          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                            Receptionist
                          </span>
                        </span>
                      )}
                      {m.content}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start">
                    <div className="px-4 py-3 rounded-lg bg-card border border-border/60 shadow-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>

              {messages.length <= 2 && (
                <div className="flex flex-wrap gap-1.5 px-3 pb-2 bg-background/40 shrink-0">
                  {CHIPS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      disabled={controlsDisabled}
                      onClick={() => send(c)}
                      className="px-2.5 py-1.5 rounded-md border border-border bg-card text-muted-foreground text-[11px] font-medium hover:border-primary/40 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}

              <form
                className="flex gap-2 p-3 border-t border-border/50 bg-card shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  send(input)
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={inputLocked ? 'Please wait 60 seconds…' : 'Type a message…'}
                  disabled={controlsDisabled}
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-input bg-background text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || controlsDisabled}
                  className="px-3.5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 disabled:opacity-40 transition-colors"
                >
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
