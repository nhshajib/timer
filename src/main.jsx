import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Single-page app: the only "home page" is App (timer UI) at the root URL (/)
class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError (err) { return { error: err } }
  componentDidCatch (err, info) { console.error('App error:', err, info) }
  render () {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, fontFamily: 'sans-serif', color: '#fff', background: '#0c1222',
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 12
        }}>
          <h1 style={{ margin: 0 }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8' }}>Check the browser console for errors.</p>
          <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, fontSize: 12, overflow: 'auto', maxWidth: '90%' }}>
            {String(this.state.error?.message || this.state.error)}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

const root = document.getElementById('root')
if (!root) {
  console.error('Root element #root not found')
} else {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  )
}

// Register Service Worker for PWA / offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope);
      })
      .catch((error) => {
        console.log('SW registration failed:', error);
      });
  });
}
