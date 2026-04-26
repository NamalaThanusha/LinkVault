// axiosInstance.js
// This is our custom Axios setup
// Instead of writing full URL every time, we configure it once here

import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // reads from your .env file
  withCredentials: true,                  // allows cookies to be sent
  headers: {
    'Content-Type': 'application/json',   // we send JSON data
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
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          { refreshToken }
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