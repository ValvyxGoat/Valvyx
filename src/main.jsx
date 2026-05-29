import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#141414',
          color: '#f0f0f0',
          border: '1px solid #1f1f1f',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#39d353', secondary: '#141414' },
        },
        error: {
          iconTheme: { primary: '#e63946', secondary: '#141414' },
        },
      }}
    />
  </React.StrictMode>
)
