// AuthSuccessPage.jsx
// Handles Google OAuth redirect
// SECURITY: Clears tokens from URL after reading them

import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { saveTokens } from '../utils/tokenUtils'
import { getMe } from '../api/authApi'

function AuthSuccessPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        const accessToken = searchParams.get('accessToken')
        const refreshToken = searchParams.get('refreshToken')

        if (!accessToken) {
          navigate('/login')
          return
        }

        // Save tokens to localStorage
        saveTokens(accessToken, refreshToken)

        // ✅ SECURITY: Remove tokens from URL immediately
        // This replaces the URL with clean /dashboard
        // so tokens are never visible in browser history
        window.history.replaceState({}, document.title, '/dashboard')

        // Fetch user data
        const response = await getMe()
        const user = response.data.data.user
        setUser(user)

        // Redirect to dashboard
        navigate('/dashboard', { replace: true })

      } catch (error) {
        console.log('Auth success error:', error)
        navigate('/login')
      }
    }

    handleAuthSuccess()
  }, [navigate, setUser, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Signing you in...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait a moment</p>
      </div>
    </div>
  )
}

export default AuthSuccessPage