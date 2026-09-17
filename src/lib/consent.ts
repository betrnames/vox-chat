export const CONSENT_KEY = 'vox-cookie-consent'
export const OPEN_CONSENT_EVENT = 'vox:open-cookie-preferences'
export const CONSENT_VERSION = 1 as const

export type ConsentRecord = {
  version: typeof CONSENT_VERSION
  necessary: true
  analytics: boolean
  updatedAt: string
}

export function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>
    if (parsed?.version !== CONSENT_VERSION || typeof parsed.analytics !== 'boolean') return null
    return {
      version: CONSENT_VERSION,
      necessary: true,
      analytics: parsed.analytics,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    }
  } catch {
    return null
  }
}

export function writeConsent(analytics: boolean): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(record))
  window.__voxApplyConsent?.(analytics)
  return record
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT))
}
