import { useEffect, useId, useRef, useState } from 'react'
import {
  OPEN_CONSENT_EVENT,
  readConsent,
  writeConsent,
} from '../lib/consent'

function isHomePage() {
  if (typeof window === 'undefined') return false
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  return path === '/' || path === '/index.html'
}

function CookieBarBody({
  titleId,
  copyId,
  onSave,
}: {
  titleId: string
  copyId: string
  onSave: (analytics: boolean) => void
}) {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-10 py-4 sm:py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 sm:max-w-2xl">
        <div className="flex items-center gap-2 mb-1.5">
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
      </div>

      <div className="flex gap-2 sm:gap-3 sm:shrink-0">
        <button
          type="button"
          onClick={() => onSave(false)}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg border border-input text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors min-h-11"
        >
          Necessary only
        </button>
        <button
          type="button"
          onClick={() => onSave(true)}
          className="flex-1 sm:flex-none px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/80 transition-colors min-h-11"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

export function CookieConsent() {
  const flowTitleId = useId()
  const flowCopyId = useId()
  const fixedTitleId = useId()
  const fixedCopyId = useId()
  const flowRef = useRef<HTMLDivElement>(null)
  const fixedRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.has('cookies') || params.has('consent') || window.location.hash === '#cookies') {
        return true
      }
    }
    return readConsent() === null
  })
  const [scrollTick, setScrollTick] = useState(0)
  const [fixedOpacity, setFixedOpacity] = useState(1)
  const onHome = isHomePage()

  useEffect(() => {
    const onOpen = () => {
      setOpen(true)
      setScrollTick((n) => n + 1)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!open) return
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.has('cookies') || params.has('consent')
    if (scrollTick === 0 && !fromQuery) return
    document.getElementById('vox-cookie-bar')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [open, scrollTick])

  useEffect(() => {
    if (!open) return
    let frame = 0
    const measure = () => {
      const flow = flowRef.current
      const fixed = fixedRef.current
      if (!flow || !fixed) return
      // Fade the viewport bar out before the footer copy reaches it, so they never stack.
      const gap = flow.getBoundingClientRect().top - fixed.getBoundingClientRect().top
      const raw = Math.min(1, Math.max(0, (gap - 48) / 220))
      const next = Math.round(raw * 20) / 20
      setFixedOpacity((prev) => (prev === next ? prev : next))
    }
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [open])

  const save = (analytics: boolean) => {
    writeConsent(analytics)
    setOpen(false)
  }

  if (!open) return null

  const fixedHidden = fixedOpacity < 0.05

  return (
    <>
      <div
        ref={flowRef}
        id="vox-cookie-bar"
        role="region"
        aria-labelledby={flowTitleId}
        aria-describedby={flowCopyId}
        inert={fixedHidden ? undefined : true}
        className={`w-full border-t border-border bg-card text-card-foreground ${
          /* Home footer pb-24 clears the mobile dock. Eat the extra 3rem, then pad so actions stay above the dock. */
          onHome ? 'max-sm:-mt-12 max-sm:pb-[calc(6rem+env(safe-area-inset-bottom,0px))]' : ''
        }`}
      >
        <CookieBarBody titleId={flowTitleId} copyId={flowCopyId} onSave={save} />
      </div>

      <div
        ref={fixedRef}
        id="vox-cookie-fixed"
        role="region"
        aria-labelledby={fixedTitleId}
        aria-describedby={fixedCopyId}
        inert={fixedHidden ? true : undefined}
        aria-hidden={fixedHidden}
        style={{ opacity: fixedOpacity, pointerEvents: fixedHidden ? 'none' : 'auto' }}
        className={`fixed inset-x-0 z-[70] w-full border-t border-border bg-card text-card-foreground shadow-[0_-12px_32px_-20px_rgba(0,0,0,0.7)] ${
          onHome
            ? 'bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-0'
            : 'bottom-0 pb-[env(safe-area-inset-bottom,0px)]'
        }`}
      >
        <CookieBarBody titleId={fixedTitleId} copyId={fixedCopyId} onSave={save} />
      </div>
    </>
  )
}
