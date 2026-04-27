// src/controllers/auth.controller.js
// Receives HTTP requests, calls service, sends response back

const authService = require('../services/auth.service')
const { successResponse, errorResponse } = require('../utils/response.utils')

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/+$/, '')

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Basic validation
    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Name, email and password are required')
    }

    if (password.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters')
    }

    const user = await authService.registerUser({ name, email, password })

    return successResponse(res, 201, 'Registration successful! Please check your email to verify your account.', { user })

  } catch (error) {
    if (error.message === 'Email already registered') {
      return errorResponse(res, 409, error.message)
    }
    return errorResponse(res, 500, 'Registration failed. Please try again.')
  }
}

// GET /api/auth/verify-email?token=xxxxx
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return errorResponse(res, 400, 'Verification token is required')
    }

    const result = await authService.verifyEmail(token)
    return successResponse(res, 200, result.message)

  } catch (error) {
    return errorResponse(res, 400, error.message)
  }
}

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return errorResponse(res, 400, 'Email and password are required')
    }

    const result = await authService.loginUser({ email, password })

    return successResponse(res, 200, 'Login successful', result)

  } catch (error) {
    if (error.message.includes('verify your email')) {
      return errorResponse(res, 403, error.message)
    }
    return errorResponse(res, 401, error.message)
  }
}

// POST /api/auth/refresh
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    const result = await authService.refreshAccessToken(refreshToken)
    return successResponse(res, 200, 'Token refreshed', result)

  } catch (error) {
    return errorResponse(res, 401, 'Invalid or expired refresh token')
  }
}

// POST /api/auth/logout
const logout = async (req, res) => {
  try {
    // req.user is set by auth middleware (coming in next step)
    const result = await authService.logoutUser(req.user.userId)
    return successResponse(res, 200, result.message)

  } catch (error) {
    return errorResponse(res, 500, 'Logout failed')
  }
}

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return errorResponse(res, 400, 'Email is required')
    }

    const result = await authService.forgotPassword(email)

    // Always return 200 — don't reveal if email exists
    return successResponse(res, 200, result.message)

  } catch (error) {
    return errorResponse(res, 500, 'Failed to process request. Please try again.')
  }
}

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return errorResponse(res, 400, 'Token and new password are required')
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters')
    }

    const result = await authService.resetPassword(token, newPassword)
    return successResponse(res, 200, result.message)

  } catch (error) {
    return errorResponse(res, 400, error.message)
  }
}

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await authService.getCurrentUser(req.user.userId)
    return successResponse(res, 200, 'User profile retrieved', { user })
  } catch (error) {
    return errorResponse(res, 404, error.message)
  }
}

// GET /api/auth/google/callback
// Google redirects here after user approves
// Passport has already processed the profile at this point
const googleCallback = async (req, res) => {
  const clientUrl = getClientUrl()

  try {
    if (!req.user) {
      return res.redirect(`${clientUrl}/login?error=google_auth_failed`)
    }

    // req.user was set by passport after Google auth succeeded
    // Now we generate our JWT tokens
    const result = await authService.googleLogin(req.user)

    // Redirect frontend with tokens in URL
    // Frontend will grab these from URL and store them
    const { accessToken, refreshToken } = result

    // Redirect to frontend with tokens
    return res.redirect(
      `${clientUrl}/auth-success?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`
    )

  } catch (error) {
    // Something went wrong — redirect to frontend error page
    return res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent('Google login failed')}`
    )
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  googleCallback,
}