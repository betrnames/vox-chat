import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BlogIndex from './BlogIndex'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlogIndex />
  </StrictMode>,
)
