/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react'
import { getMe, loginUser, logoutUser, startGoogleLogin } from '../api/authApi'
import { saveTokens, clearTokens, isLoggedIn } from '../utils/tokenUtils'

// Create the context
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is already logged in when app loads
  useEffect(() => {
    const checkAuth = async () => {
      if (isLoggedIn()) {
        try {
          const response = await getMe()
          setUser(response.data.data.user)
        } catch {
          clearTokens()
          setUser(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    const response = await loginUser({ email, password })

    const data = response.data.data || response.data
    const { accessToken, refreshToken, user } = data

    saveTokens(accessToken, refreshToken)
    setUser(user)
    return response
  }

  // Logout function
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      await logoutUser({ refreshToken })
    } catch (error) {
      console.log('Logout error:', error)
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  // Google Login
  const googleLogin = () => {
    startGoogleLogin()
  }

  const value = {
    user,
    loading,
    login,
    logout,
    googleLogin,
    setUser,          // ← ADD THIS LINE
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading LinkVault...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

// ✅ THIS WAS MISSING — useAuth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}