import { useCallback, useState, type FormEvent } from 'react'
import { trackEvent } from './analytics'
import { checkLead, HONEYPOT_FIELD, STARTED_FIELD } from './spamGuard.js'

export const FORMSPREE_URL = 'https://formspree.io/f/xzezgyen'

export type LeadStatus = 'idle' | 'sending' | 'done' | 'error'

/** Fields api/lead.js understands; everything else is folded into `notes`. */
const KNOWN = new Set(['name', 'phone', 'email', 'business', 'city', 'trade', 'interest', 'source', HONEYPOT_FIELD, STARTED_FIELD])
const SKIP = new Set(['_next', '_subject', 'site'])

function toLeadPayload(fd: FormData, source: string) {
  const out: Record<string, string> = { source }
  const extras: string[] = []
  fd.forEach((v, k) => {
    if (typeof v !== 'string' || !v.trim() || SKIP.has(k)) return
    if (KNOWN.has(k)) out[k] = v.trim()
    else if (k === 'service' && !fd.get('interest')) out.interest = v.trim()
    else extras.push(`${k}: ${v.trim()}`)
  })
  if (extras.length) out.notes = extras.join(' | ')
  return out
}

/**
 * Submit a lead form through /api/lead (keeps the visitor on the page).
 * If the API fails, post the same form to Formspree; if that fails too, fall back
 * to a normal browser form submit so the lead is never lost.
 */
export function useLeadForm(source: string) {
  const [status, setStatus] = useState<LeadStatus>('idle')

  const onSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const form = e.currentTarget
      if (status === 'sending') return
      setStatus('sending')
      const fd = new FormData(form)
      const formSource = (fd.get('source') as string) || source
      const payload = toLeadPayload(fd, formSource)
      payload.cityExpected = form.elements.namedItem('city') ? '1' : ''
      const verdict = checkLead(payload, { cityExpected: !!payload.cityExpected })
      if (verdict.spam) {
        // Likely bot: hand it to the API (which logs it as spam, no email/SMS) and
        // show the normal success state. Never fall back to Formspree.
        fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }).catch(() => {})
        setStatus('done')
        return
      }

      let via: 'api' | 'formspree' | null = null
      try {
        const r = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (r.ok) via = 'api'
        else if (r.status === 422) {
          setStatus('done') // server judged it spam; don't retry via Formspree
          return
        }
      } catch {
        /* fall through to Formspree */
      }
      if (!via) {
        try {
          const r = await fetch(form.action || FORMSPREE_URL, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: fd,
          })
          if (r.ok) via = 'formspree'
        } catch {
          /* fall through */
        }
      }
      if (!via) {
        setStatus('error')
        form.submit() // last resort: native POST to Formspree
        return
      }
      trackEvent('generate_lead', { form_source: formSource, lead_channel: via })
      setStatus('done')
    },
    [source, status],
  )

  return { status, onSubmit }
}

/**
 * Hidden anti-spam fields for every lead form: Formspree's `_gotcha` honeypot
 * (off-screen, not focusable) and a render timestamp for the time-on-page check.
 */
export function SpamGuardFields() {
  const [startedAt] = useState(() => String(Date.now()))
  return (
    <>
      <input type="hidden" name={STARTED_FIELD} value={startedAt} />
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
        <label>
          Leave this empty
          <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  )
}
