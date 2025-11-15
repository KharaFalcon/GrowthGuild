import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

const container = document.getElementById('root')!
const root = createRoot(container)
try {
  console.log('[GrowthGuild] Mounting App...')
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (e) {
  // log errors during initial render so they're visible in the terminal
  // eslint-disable-next-line no-console
  console.error('[GrowthGuild] Error mounting App', e)
  // Render a minimal fallback so the page is not completely blank in production builds
  container.innerHTML = '<div style="padding:24px;font-family:Arial">Application failed to load. Check the developer console for errors.</div>'
}

// Global error handlers to avoid a completely blank page and to show useful debug info in the DOM
window.addEventListener('error', (ev) => {
  console.error('[GrowthGuild] Uncaught error', ev.error || ev.message)
  try {
    const msg = (ev.error && ev.error.stack) || ev.message || String(ev)
    document.body.innerHTML = `<div style="padding:24px;font-family:Arial;color:#111;background:#fff9e6;">
      <h2>Application Error</h2>
      <pre style="white-space:pre-wrap;">${String(msg)}</pre>
      <p>Open the browser console for more details.</p>
    </div>`
  } catch (e) {
    // ignore
  }
})

window.addEventListener('unhandledrejection', (ev) => {
  console.error('[GrowthGuild] Unhandled rejection', ev.reason)
  try {
    const msg = (ev.reason && (ev.reason.stack || ev.reason.message)) || String(ev.reason)
    document.body.innerHTML = `<div style="padding:24px;font-family:Arial;color:#111;background:#fff9e6;">
      <h2>Unhandled Rejection</h2>
      <pre style="white-space:pre-wrap;">${String(msg)}</pre>
      <p>Open the browser console for more details.</p>
    </div>`
  } catch (e) {
    // ignore
  }
})
