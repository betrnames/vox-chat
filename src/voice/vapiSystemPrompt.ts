/**
 * Vapi system prompts for phone (dashboard assistant) vs browser (web SDK).
 * Source of truth: the .txt files next to this module.
 */
import phonePrompt from './vapi-system-prompt.txt?raw'
import webPrompt from './vapi-system-prompt-web.txt?raw'

/** Phone inbound assistant (includes transferCall-first handoff). */
export const VOX_VOICE_SYSTEM_PROMPT = phonePrompt.trim()

/**
 * Browser / website mic sessions only.
 * Never uses transferCall — that crashes webCalls with error-transfer-failed.
 * Live human path = notifyLuisLive (SMS Luis + optional callback bridge from free Vapi line).
 */
export const VOX_VOICE_WEB_SYSTEM_PROMPT = webPrompt.trim()
