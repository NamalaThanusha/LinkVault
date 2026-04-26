// src/config/rateLimit.js

const rateLimit = require('express-rate-limit')

// General API limit — applies to all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 100,                    // Max 100 requests per 15 min per IP
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Strict limit for auth routes — prevents brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 10,                     // Max 10 attempts per 15 min per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Very strict for forgot password — prevents email bombing
const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,   // 1 hour
  max: 3,                      // Max 3 requests per hour per IP
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  generalLimiter,
  authLimiter,
  forgotPasswordLimiter,
}