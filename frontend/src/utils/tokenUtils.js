// tokenUtils.js
// Helper functions to save, get, and remove tokens
// We keep all token logic in ONE place

// ── Save tokens after login ────────────────
export const saveTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
}

// ── Get access token ───────────────────────
export const getAccessToken = () => {
  return localStorage.getItem('accessToken')
}

// ── Get refresh token ──────────────────────
export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken')
}

// ── Remove tokens on logout ────────────────
export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

// ── Check if user is logged in ─────────────
export const isLoggedIn = () => {
  return !!localStorage.getItem('accessToken')
  // !! converts value to true/false
  // If token exists → true
  // If no token → false
}