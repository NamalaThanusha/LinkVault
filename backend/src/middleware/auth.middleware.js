// src/middleware/auth.middleware.js
// Protects routes — checks if user has a valid access token

const { verifyAccessToken } = require('../utils/jwt.utils')
const { errorResponse } = require('../utils/response.utils')

const protect = (req, res, next) => {
  try {
    // Token comes in header: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 401, 'Access denied. No token provided.')
    }

    // Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1]

    // Verify the token — throws error if invalid or expired
    const decoded = verifyAccessToken(token)

    // Attach user info to request — available in all next handlers
    req.user = decoded

    next()   // Move to the next middleware or controller

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 401, 'Access token expired. Please refresh.')
    }
    return errorResponse(res, 401, 'Invalid token.')
  }
}

module.exports = { protect }