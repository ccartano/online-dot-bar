import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import { initializeGTM } from './utils/gtm'

// Initialize GTM only for non-admin routes
if (!window.location.pathname.startsWith('/admin') && import.meta.env.PROD) {
  console.log(import.meta.env.MODE);
  initializeGTM()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)
