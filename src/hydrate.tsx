import { StrictMode, type ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { CookieConsent } from './components/CookieConsent'

/** Hydrate when root was filled by SSG; otherwise client-render. */
export function mount(node: ReactNode) {
  const el = document.getElementById('root')
  if (!el) throw new Error('#root not found')
  const tree = <StrictMode>{node}</StrictMode>
  if (el.hasChildNodes()) {
    hydrateRoot(el, tree)
  } else {
    createRoot(el).render(tree)
  }

  const hostId = 'vox-cookie-consent'
  let host = document.getElementById(hostId)
  if (!host) {
    host = document.createElement('div')
    host.id = hostId
    document.body.appendChild(host)
  }
  if (!host.dataset.mounted) {
    host.dataset.mounted = '1'
    createRoot(host).render(
      <StrictMode>
        <CookieConsent />
      </StrictMode>,
    )
  }
}
