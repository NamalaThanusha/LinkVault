// axiosInstance.js
// This is our custom Axios setup
// Instead of writing full URL every time, we configure it once here

import axios from 'axios'

const trimTrailingSlash = (value) => value.replace(/\/+$/, '')

const ensureApiPrefix = (value) => {
  const normalized = trimTrailingSlash(value)
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`
}

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim()

  // Works with both:
  // - VITE_API_URL=https://your-backend.onrender.com
  // - VITE_API_URL=https://your-backend.onrender.com/api
  if (envUrl) {
    return ensureApiPrefix(envUrl)
  }

  // Friendly fallback for local development.
  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api'
  }

  // In production, prefer an explicit VITE_API_URL. This fallback
  // supports setups that proxy /api from the frontend host.
  return '/api'
}

export const API_BASE_URL = resolveApiBaseUrl()

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ─────────────────────────────────────────
// REQUEST INTERCEPTOR
// Runs BEFORE every request is sent
// Automatically attaches JWT token to every request
// ─────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Get token from browser storage
    const token = localStorage.getItem('accessToken')

    // If token exists, attach it to request header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ─────────────────────────────────────────
// RESPONSE INTERCEPTOR
// Runs AFTER every response comes back
// Handles expired tokens automatically
// ─────────────────────────────────────────
api.interceptors.response.use(
  // If response is successful, just return it
  (response) => response,

  // If response has an error
  async (error) => {
    const originalRequest = error.config

    // If error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true // mark that we are retrying

      try {
        // Try to get a new access token using refresh token
        const refreshToken = localStorage.getItem('refreshToken')

        const response = await axios.post(
          buildApiUrl('/auth/refresh'),
          { refreshToken },
          { withCredentials: true }
        )

        // Save the new access token
        const { accessToken } = response.data.data
        localStorage.setItem('accessToken', accessToken)

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh token also expired → force logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api