import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{
          style: { fontFamily: 'var(--font-body)', fontSize: '.9rem', borderRadius: '10px' },
          success: { style: { background: 'var(--olive-light)', color: 'var(--olive)' } },
          error: { style: { background: '#fef2f2', color: '#b91c1c' } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
