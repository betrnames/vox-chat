/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VAPI_PUBLIC_KEY?: string
  readonly VITE_VAPI_ASSISTANT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
  __voxApplyConsent?: (analytics: boolean) => void
}
