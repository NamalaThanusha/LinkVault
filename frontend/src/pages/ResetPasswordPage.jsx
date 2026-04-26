// ResetPasswordPage.jsx
// Fixed version - sends token correctly to backend

import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { resetPassword } from '../api/authApi'
import InputField from '../components/InputField'
import Button from '../components/Button'

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const navigate = useNavigate()

  // ✅ Better way to get URL params
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (serverError) setServerError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

 const handleSubmit = async (e) => {
  e.preventDefault()

  const validationErrors = validate()
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    return
  }

  if (!token) {
    setServerError('Invalid reset link. Please request a new one.')
    return
  }

  setServerError('')
  setLoading(true)

  try {
    // Send token + password (authApi will map it to newPassword)
    await resetPassword({
      token: token,
      password: formData.password,
    })

    // Success → go to login
    navigate('/login')

  } catch (error) {
    console.log('Reset error:', error.response?.data)
    setServerError(
      error.response?.data?.message ||
      'Reset failed. Please try again.'
    )
  } finally {
    setLoading(false)
  }
}

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Invalid Link</h2>
          <p className="text-gray-500 mb-6">
            This reset link is invalid or expired. Please request a new one.
          </p>
          <button
            onClick={() => navigate('/forgot-password')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Request New Link
          </button>
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
          <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-2">Enter your new password below</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">

          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 text-center">❌ {serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <InputField
              label="New Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              error={errors.password}
              disabled={loading}
            />

            <InputField
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
              error={errors.confirmPassword}
              disabled={loading}
            />

            <Button type="submit" loading={loading} fullWidth>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage