// authApi.js
// All authentication related API calls live here
// Each function = one backend endpoint

import api from './axiosInstance'

// ── Register new user ──────────────────────
export const registerUser = (data) => {
  // POST /auth/register
  // data = { name, email, password }
  return api.post('/auth/register', data)
}

// ── Login user ─────────────────────────────
export const loginUser = (data) => {
  // POST /auth/login
  // data = { email, password }
  return api.post('/auth/login', data)
}

// ── Logout user ────────────────────────────
export const logoutUser = (data) => {
  // POST /auth/logout
  // data = { refreshToken }
  return api.post('/auth/logout', data)
}

// ── Refresh access token ───────────────────
export const refreshToken = (data) => {
  // POST /auth/refresh
  // data = { refreshToken }
  return api.post('/auth/refresh', data)
}

// ── Get current logged in user ─────────────
export const getMe = () => {
  // GET /auth/me
  // No data needed — token is auto-attached by interceptor
  return api.get('/auth/me')
}

// ── Forgot password ────────────────────────
export const forgotPassword = (data) => {
  // POST /auth/forgot-password
  // data = { email }
  return api.post('/auth/forgot-password', data)
}

// ── Reset password ─────────────────────────
// ── Reset password ─────────────────────────
export const resetPassword = (data) => {
  // Backend expects: { token, newPassword }
  return api.post('/auth/reset-password', {
    token: data.token,
    newPassword: data.password, // ← map password → newPassword
  })
}

// ── Google OAuth login ─────────────────────
export const googleLogin = () => {
  // Redirects browser to Google login page
  // This is NOT an axios call — it's a direct redirect
  window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`
}