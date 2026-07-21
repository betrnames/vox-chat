import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import Vapi from '@vapi-ai/web'

const publicKey = (import.meta.env.VITE_VAPI_PUBLIC_KEY || '').trim()
const assistantId = (import.meta.env.VITE_VAPI_ASSISTANT_ID || '').trim()

export type VapiCallStatus = 'idle' | 'connecting' | 'active' | 'error'

type VapiVoiceContextValue = {
  /** Public key + assistant ID present */
  ready: boolean
  status: VapiCallStatus
  isSpeaking: boolean
  error: string | null
  start: () => Promise<void>
  stop: () => void
  toggle: () => Promise<void>
}

const VapiVoiceContext = createContext<VapiVoiceContextValue | null>(null)

export function VapiVoiceProvider({ children }: { children: ReactNode }) {
  const vapiRef = useRef<Vapi | null>(null)
  const [status, setStatus] = useState<VapiCallStatus>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ready = Boolean(publicKey && assistantId)

  useEffect(() => {
    if (!ready) return

    const vapi = new Vapi(publicKey)
    vapiRef.current = vapi

    const onStart = () => {
      setStatus('active')
      setError(null)
    }
    const onEnd = () => {
      setStatus('idle')
      setIsSpeaking(false)
    }
    const onSpeechStart = () => setIsSpeaking(true)
    const onSpeechEnd = () => setIsSpeaking(false)
    const onError = (err: unknown) => {
      console.error('[vapi]', err)
      setStatus('error')
      setIsSpeaking(false)
      const msg =
        err && typeof err === 'object' && 'message' in err && typeof (err as { message: unknown }).message === 'string'
          ? (err as { message: string }).message
          : 'Voice agent error — try again or use the form.'
      setError(msg)
      // Surface briefly then return to idle so user can retry
      window.setTimeout(() => {
        setStatus((s) => (s === 'error' ? 'idle' : s))
      }, 4000)
    }

    vapi.on('call-start', onStart)
    vapi.on('call-end', onEnd)
    vapi.on('speech-start', onSpeechStart)
    vapi.on('speech-end', onSpeechEnd)
    vapi.on('error', onError)

    return () => {
      try {
        vapi.stop()
      } catch {
        /* ignore */
      }
      vapi.removeAllListeners()
      vapiRef.current = null
    }
  }, [ready])

  const stop = useCallback(() => {
    try {
      vapiRef.current?.stop()
    } catch {
      /* ignore */
    }
    setStatus('idle')
    setIsSpeaking(false)
  }, [])

  const start = useCallback(async () => {
    if (!ready || !vapiRef.current) {
      setError('Voice agent not configured. Set VITE_VAPI_PUBLIC_KEY and VITE_VAPI_ASSISTANT_ID.')
      setStatus('error')
      return
    }
    if (status === 'connecting' || status === 'active') return

    setError(null)
    setStatus('connecting')
    try {
      await vapiRef.current.start(assistantId)
    } catch (err) {
      console.error('[vapi] start', err)
      setStatus('error')
      setError('Could not start voice agent. Allow microphone and try again.')
      window.setTimeout(() => setStatus('idle'), 4000)
    }
  }, [ready, status])

  const toggle = useCallback(async () => {
    if (status === 'active' || status === 'connecting') {
      stop()
      return
    }
    await start()
  }, [start, stop, status])

  const value = useMemo(
    () => ({ ready, status, isSpeaking, error, start, stop, toggle }),
    [ready, status, isSpeaking, error, start, stop, toggle],
  )

  return (
    <VapiVoiceContext.Provider value={value}>
      {children}
      <VoiceCallHud />
    </VapiVoiceContext.Provider>
  )
}

export function useVapiVoice(): VapiVoiceContextValue {
  const ctx = useContext(VapiVoiceContext)
  if (!ctx) {
    throw new Error('useVapiVoice must be used within VapiVoiceProvider')
  }
  return ctx
}

/** Safe outside provider (returns null). */
export function useVapiVoiceOptional(): VapiVoiceContextValue | null {
  return useContext(VapiVoiceContext)
}

/** Button / link-styled control that starts (or ends) the Vapi web call. */
export function VoiceCallTrigger({
  children,
  className,
  idleLabel,
  activeLabel = 'End call',
  connectingLabel = 'Connecting…',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  idleLabel?: ReactNode
  activeLabel?: ReactNode
  connectingLabel?: ReactNode
}) {
  const { status, toggle, ready } = useVapiVoice()
  const busy = status === 'connecting'
  const active = status === 'active'

  return (
    <button
      type="button"
      {...rest}
      className={className}
      onClick={(e) => {
        rest.onClick?.(e)
        if (!e.defaultPrevented) void toggle()
      }}
      disabled={rest.disabled || (!ready && !active) || busy}
      aria-pressed={active}
      aria-busy={busy}
    >
      {children ?? (active ? activeLabel : busy ? connectingLabel : idleLabel)}
    </button>
  )
}

/** Compact in-call bar — sits above the mobile dock so it doesn’t cover CTAs. */
function VoiceCallHud() {
  const ctx = useContext(VapiVoiceContext)
  if (!ctx) return null
  const { status, isSpeaking, error, stop } = ctx
  if (status === 'idle' && !error) return null

  const label =
    status === 'connecting'
      ? 'Connecting to AI agent…'
      : status === 'active'
        ? isSpeaking
          ? 'Agent speaking…'
          : 'Listening…'
        : error || 'Voice agent error'

  return (
    <div
      className="fixed left-1/2 z-[60] w-[min(100%-1.5rem,22rem)] -translate-x-1/2 rounded-xl border border-voice/40 bg-background/95 px-3 py-2.5 shadow-lg shadow-black/20 backdrop-blur-md"
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
            status === 'active'
              ? isSpeaking
                ? 'bg-voice animate-pulse'
                : 'bg-primary animate-pulse'
              : status === 'connecting'
                ? 'bg-voice/70 animate-pulse'
                : 'bg-red-500'
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-wider text-voice">Vox Voice</p>
          <p className="truncate text-sm text-foreground">{label}</p>
        </div>
        {(status === 'active' || status === 'connecting') && (
          <button
            type="button"
            onClick={stop}
            className="shrink-0 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
          >
            End
          </button>
        )}
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground/80 font-mono">
        Mic required · call may be recorded
      </p>
    </div>
  )
}
