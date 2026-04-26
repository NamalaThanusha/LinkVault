// VerifyEmailPage.jsx
// Handles email verification when user clicks link in email
// URL: /verify-email?token=xxxxx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'

function VerifyEmailPage() {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search)
        const token = urlParams.get('token')

        if (!token) {
          setStatus('error')
          setMessage('Invalid verification link. Please register again.')
          return
        }

        // Call backend to verify email
        await api.get(`/auth/verify-email?token=${token}`)

        setStatus('success')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)

      } catch (error) {
        setStatus('error')
        setMessage(
          error.response?.data?.message ||
          'Verification failed. Link may have expired.'
        )
      }
    }

    verifyEmail()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">

        {/* Verifying state */}
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying your email...
            </h2>
            <p className="text-gray-500">Please wait a moment.</p>
          </>
        )}

        {/* Success state */}
        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Email Verified!
            </h2>
            <p className="text-gray-500 mb-6">
              Your account is now active. Redirecting you to login...
            </p>
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </>
        )}

        {/* Error state */}
        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Verification Failed
            </h2>
            <p className="text-gray-500 mb-6">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
          </>
        )}

      </div>
    </div>
  )
}

export default VerifyEmailPage