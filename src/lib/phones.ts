/** Public-facing Vox voice numbers (E.164 + display). */

/** Free Vapi inbound line — real phone dial path for AI + live transfer to Luis. */
export const VAPI_FREE_NUMBER_E164 = '+12095023028'
export const VAPI_FREE_NUMBER_DISPLAY = '(209) 502-3028'
export const VAPI_FREE_NUMBER_TEL = `tel:${VAPI_FREE_NUMBER_E164}`

/** Luis cell — transfer destination for live human (not a public sales line). */
export const LUIS_CELL_E164 = '+12099967102'

/** True for phones/tablets — use native dialer for real PSTN agent calls. */
export function prefersNativePhoneDial(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const coarse =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches
  return (
    coarse ||
    /Android|iPhone|iPad|iPod|Mobile|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  )
}
