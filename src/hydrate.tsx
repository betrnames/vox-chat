import { StrictMode, type ReactNode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'

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
}
