import { useEffect, useRef, useState } from 'react'
import { TypingDots } from './TypingDots'

type Msg = { role: 'user' | 'assistant'; content: string }

const OPENING =
  "Hi — I'm Vox's AI Receptionist. I help HVAC, plumbing, and electrical owners stop losing jobs to missed calls, dead website forms, and forgotten review asks. What's the biggest pain right now?"

const CHIPS = [
  'Missed after-hours calls',
  'Need more Google reviews',
  'Website visitors not converting',
  'Tell me about the bundle',
]

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

async function chat(messages: Msg[]): Promise<{ reply: string; notified?: string[] } | { error: string }> {
  try {
    const res = await fetch('/api/receptionist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'live',
        source: 'site-widget',
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    })
    const data = (await res.json()) as {
      reply?: string
      notified?: string[]
      error?: string
      fallback?: boolean
    }
    if (!res.ok || !data.reply) {
      return { error: data.error || 'unavailable' }
    }
    return { reply: data.reply, notified: data.notified }
  } catch {
    return { error: 'network' }
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

export default function LiveReceptionistWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [online, setOnline] = useState(
    () => (typeof navigator !== 'undefined' ? navigator.onLine : true),
  )
  const [messages, setMessages] = useState<Msg[]>([{ role: 'assistant', content: OPENING }])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const goOnline = () => setOnline(true)
    const goOffline = () => setOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, typing, open])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || typing) return

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

    const result = await chat(next)
    setTyping(false)

    if ('error' in result) {
      setOnline(false)
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            "I'm having trouble connecting right now. Call or text (209) 996-7102 or use the contact form — Gabe will get back to you fast.",
        },
      ])
      return
    }

    setOnline(true)
    setMessages((m) => [...m, { role: 'assistant', content: result.reply }])
    if (result.notified?.length) setLeadSent(true)
  }

  return (
    <>
      {/* Launcher — primary brand + three-dot mark */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="fixed z-[60] bottom-20 sm:bottom-6 right-4 sm:right-6 flex items-center gap-2.5 rounded-full border border-border/60 bg-background/95 backdrop-blur-xl text-foreground shadow-lg shadow-black/10 dark:shadow-black/40 px-4 py-3 text-sm font-semibold hover:border-primary/40 hover:bg-muted active:scale-[0.98] transition-all"
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
            <span className="font-medium">Chat with AI</span>
            <span className="hidden sm:inline ml-0.5">
              <StatusPill online={online} compact />
            </span>
          </>
        )}
      </button>

      {open && (
        <div
          id="vox-live-receptionist"
          className="fixed z-[60] bottom-36 sm:bottom-24 right-4 sm:right-6 w-[min(100vw-2rem,380px)] h-[min(70vh,520px)] flex flex-col rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/15 dark:shadow-black/50 overflow-hidden"
          role="dialog"
          aria-label="Vox AI Receptionist"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm">
            <BrandDots size="md" />
            <div className="min-w-0 flex-1">
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
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 p-3 bg-background/40">
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
            <div className="flex flex-wrap gap-1.5 px-3 pb-2 bg-background/40">
              {CHIPS.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={typing}
                  onClick={() => send(c)}
                  className="px-2.5 py-1 rounded-md border border-border bg-card text-muted-foreground text-[11px] font-medium hover:border-primary/40 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
                >
                  {c}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 p-3 border-t border-border/50 bg-card"
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-base placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 disabled:opacity-40 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
