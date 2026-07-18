import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import LegalPage from './LegalPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LegalPage />
  </StrictMode>,
)
