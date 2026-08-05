/** Public-facing Vox voice numbers (E.164 + display). */

/** Free Vapi inbound line — callers dial this to reach the AI agent (phone path). */
export const VAPI_FREE_NUMBER_E164 = '+12095023028'
export const VAPI_FREE_NUMBER_DISPLAY = '(209) 502-3028'
export const VAPI_FREE_NUMBER_TEL = `tel:${VAPI_FREE_NUMBER_E164}`

/** Luis cell — transfer destination for live human (not shown as public sales line). */
export const LUIS_CELL_E164 = '+12099967102'
