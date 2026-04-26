// src/utils/jwt.utils.js
// Helper functions to create and verify JWT tokens

const jwt = require('jsonwebtoken')

// Generate short-lived access token (15 minutes)
const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId },                          // Payload — data stored inside token
    process.env.JWT_SECRET,              // Secret key to sign the token
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  )
}

// Generate long-lived refresh token (7 days)
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
  )
}

// Verify access token — returns decoded payload or throws error
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET)
}

// Verify refresh token
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET)
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
}