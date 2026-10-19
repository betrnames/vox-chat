/** Small GA4 helper. No-op unless consent-boot.js / gtag exist; never adds tracking IDs. */
type Params = Record<string, string | number | boolean | undefined>

export function trackEvent(name: string, params: Params = {}): void {
  if (typeof window === 'undefined') return
  try {
    if (typeof window.__voxTrack === 'function') window.__voxTrack(name, params)
    else if (typeof window.gtag === 'function') window.gtag('event', name, params)
  } catch {
    /* analytics must never break the page */
  }
}
