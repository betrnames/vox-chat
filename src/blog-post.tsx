import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BlogPost from './BlogPost'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BlogPost />
  </StrictMode>,
)
