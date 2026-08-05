import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { VoiceCallTrigger } from './VapiVoice'
import {
  VAPI_FREE_NUMBER_DISPLAY,
  VAPI_FREE_NUMBER_TEL,
  prefersNativePhoneDial,
} from '../lib/phones'

type Props = ButtonHTMLAttributes<HTMLButtonElement | HTMLAnchorElement> & {
  /** Desktop browser mic label */
  browserLabel?: ReactNode
  activeLabel?: ReactNode
  connectingLabel?: ReactNode
  /** Force browser mic even on mobile (testing) */
  forceBrowser?: boolean
}

/**
 * Smart "Call now":
 * - Phone/tablet: opens native dialer to free Vapi line (209-502-3028) → real PSTN
 *   call that can transfer to Luis.
 * - Desktop: starts browser WebRTC agent (cannot PSTN-transfer; live person = SMS + callback ring).
 */
export function CallNowButton({
  className,
  browserLabel = 'Call now',
  activeLabel = 'End call',
  connectingLabel = 'Connecting…',
  forceBrowser = false,
  onClick,
  ...rest
}: Props) {
  const useNative = !forceBrowser && prefersNativePhoneDial()

  if (useNative) {
    return (
      <a
        href={VAPI_FREE_NUMBER_TEL}
        className={className}
        onClick={onClick as any}
        aria-label={`Call AI agent at ${VAPI_FREE_NUMBER_DISPLAY}`}
        {...(rest as ButtonHTMLAttributes<HTMLAnchorElement>)}
      >
        {browserLabel}
      </a>
    )
  }

  return (
    <VoiceCallTrigger
      className={className}
      idleLabel={browserLabel}
      activeLabel={activeLabel}
      connectingLabel={connectingLabel}
      onClick={onClick as any}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    />
  )
}
