import { useEffect, useId, useState } from 'react'
import {
  OPEN_CONSENT_EVENT,
  readConsent,
  writeConsent,
} from '../lib/consent'

function Toggle({
  checked,
  disabled,
  onChange,
  labelledBy,
}: {
  checked: boolean
  disabled?: boolean
  onChange?: (next: boolean) => void
  labelledBy: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors ${
        checked ? 'bg-primary border-primary' : 'bg-muted border-border'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export function CookieConsent() {
  const titleId = useId()
  const copyId = useId()
  const necessaryId = useId()
  const analyticsId = useId()

  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('cookies') || params.has('consent') || window.location.hash === '#cookies') {
        return true
      }
    }
    return readConsent() === null
  })
  const [prefs, setPrefs] = useState(false)
  const [analytics, setAnalytics] = useState(() => readConsent()?.analytics ?? false)

  useEffect(() => {
    const onOpen = () => {
      setAnalytics(readConsent()?.analytics ?? false)
      setPrefs(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen)
  }, [])

  const save = (nextAnalytics: boolean) => {
    writeConsent(nextAnalytics)
    setAnalytics(nextAnalytics)
    setOpen(false)
    setPrefs(false)
  }

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-6 safe-area-bottom flex justify-center">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-describedby={copyId}
        className="pointer-events-auto vox-slideup mx-auto w-full max-w-xl rounded-2xl border border-border/70 bg-background/95 backdrop-blur-xl shadow-xl shadow-black/20 dark:shadow-black/50"
      >
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-voice" />
              <span className="w-1.5 h-1.5 rounded-full bg-chat" />
              <span className="w-1.5 h-1.5 rounded-full bg-review" />
            </span>
            <h2 id={titleId} className="font-serif text-sm font-semibold tracking-tight">
              Cookies
            </h2>
          </div>

          <p id={copyId} className="text-sm text-muted-foreground leading-relaxed">
            Necessary cookies keep the site working. Optional analytics (Google Analytics) help us
            see which pages get used. No ads.{' '}
            <a href="/legal.html#cookies" className="text-foreground/80 underline underline-offset-2 hover:text-foreground">
              Cookie policy
            </a>
          </p>

          {prefs && (
            <div className="mt-4 space-y-3 rounded-xl border border-border/60 bg-muted/40 p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p id={necessaryId} className="text-sm font-medium text-foreground">
                    Necessary
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Theme and your cookie choice. Always on.
                  </p>
                </div>
                <Toggle checked disabled labelledBy={necessaryId} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p id={analyticsId} className="text-sm font-medium text-foreground">
                    Analytics
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Google Analytics, loaded only if you allow it.
                  </p>
                </div>
                <Toggle
                  checked={analytics}
                  onChange={setAnalytics}
                  labelledBy={analyticsId}
                />
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => (prefs ? setPrefs(false) : setPrefs(true))}
              className="sm:mr-auto px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-11"
            >
              {prefs ? 'Back' : 'Customize'}
            </button>
            <button
              type="button"
              onClick={() => save(false)}
              className="px-4 py-2.5 rounded-lg border border-input text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors min-h-11"
            >
              Necessary only
            </button>
            <button
              type="button"
              onClick={() => save(prefs ? analytics : true)}
              className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors min-h-11"
            >
              {prefs ? 'Save' : 'Accept'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
