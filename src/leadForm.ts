import { useCallback, useState, type FormEvent } from 'react'
import { trackEvent } from './analytics'

export const FORMSPREE_URL = 'https://formspree.io/f/xzezgyen'

export type LeadStatus = 'idle' | 'sending' | 'done' | 'error'

/** Fields api/lead.js understands; everything else is folded into `notes`. */
const KNOWN = new Set(['name', 'phone', 'email', 'business', 'city', 'trade', 'interest', 'source'])
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

      let via: 'api' | 'formspree' | null = null
      try {
        const r = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toLeadPayload(fd, formSource)),
        })
        if (r.ok) via = 'api'
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
