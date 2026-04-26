// ForgotPasswordPage.jsx
// User enters email → backend sends reset link

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../api/authApi'
import InputField from '../components/InputField'
import Button from '../components/Button'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      setError('Email is required')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setError('')
    setLoading(true)

    try {
      await forgotPassword({ email })
      setSuccess(true)
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📧</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Email Sent!</h2>
          <p className="text-gray-500 mb-6">
            We sent a password reset link to <span className="font-semibold text-blue-600">{email}</span>. Check your inbox!
          </p>
          <Link to="/login">
            <Button fullWidth>Back to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔖</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-500 mt-2">Enter your email to reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="you@example.com"
              error={error}
              disabled={loading}
            />

            <Button type="submit" loading={loading} fullWidth>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
