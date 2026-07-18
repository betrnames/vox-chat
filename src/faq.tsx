import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FaqPage from './FaqPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FaqPage />
  </StrictMode>,
)
