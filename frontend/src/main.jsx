// main.jsx
// Entry point of your React app
// We wrap everything with AuthProvider so
// ALL components can access auth state

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* AuthProvider wraps App so auth data is available everywhere */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)