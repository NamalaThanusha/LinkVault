// LoginPage.jsx
// Complete login page with:
// - Email/password login
// - Google OAuth login
// - Form validation
// - Error handling
// - Redirect after login

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/InputField'
import Button from '../components/Button'

function LoginPage() {
  // ── State ──────────────────────────────────
  // formData holds what user types in the form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // errors holds validation error messages
  const [errors, setErrors] = useState({})

  // loading = true while API call is happening
  const [loading, setLoading] = useState(false)

  // serverError = error message from backend
  const [serverError, setServerError] = useState('')

  // ── Hooks ──────────────────────────────────
  const { login, googleLogin } = useAuth() // get functions from context
  const navigate = useNavigate()           // for redirecting after login

  // ── Handle input change ───────────────────
  // Called every time user types in an input
  const handleChange = (e) => {
    const { name, value } = e.target

    // Update formData with new value
    setFormData(prev => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // ── Validate form ─────────────────────────
  // Check if all fields are filled correctly
  const validate = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    return newErrors
  }

  // ── Handle form submit ────────────────────
  const handleSubmit = async (e) => {
  e.preventDefault()
  console.log('Form submitted!')  // debug

  const validationErrors = validate()
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    return
  }

  setServerError('')
  setLoading(true)

  try {
    console.log('Calling login...')  // debug
    await login(formData.email, formData.password)
    console.log('Login success!')   // debug
    navigate('/dashboard')

  } catch (error) {
    console.log('Login error:', error)
    console.log('Error response:', error.response?.data)

    const message =
      error.response?.data?.message ||
      error.message ||
      'Login failed. Please try again.'
    setServerError(message)
  } finally {
    setLoading(false)
  }
}

  // ── UI ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">

      {/* Card Container */}
      <div className="w-full max-w-md">

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🔖</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">LinkVault</h1>
          <p className="text-gray-500 mt-2">Welcome back! Sign in to continue.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {/* Server Error Message */}
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">❌ {serverError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email Input */}
            <InputField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              error={errors.email}
              disabled={loading}
            />

            {/* Password Input */}
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              error={errors.password}
              disabled={loading}
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              loading={loading}
              fullWidth
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Google Login Button */}
          <Button
            variant="google"
            fullWidth
            onClick={googleLogin}
            disabled={loading}
          >
            {/* Google Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          {/* Register Link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Create one free
            </Link>
          </p>

        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Protected by LinkVault Security 🔒
        </p>

      </div>
    </div>
  )
}

export default LoginPage