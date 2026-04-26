// ProtectedRoute.jsx
// Now uses AuthContext instead of directly reading localStorage
// Much cleaner and more reliable

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  // Get auth state from context
  const { isAuthenticated, loading } = useAuth()

  // Still loading → show nothing (AuthProvider handles loading screen)
  if (loading) return null

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in → show the page
  return children
}

export default ProtectedRoute