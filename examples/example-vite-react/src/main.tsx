import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Keep a minimal CSS to ensure a CSS asset exists for StyleX injection
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
