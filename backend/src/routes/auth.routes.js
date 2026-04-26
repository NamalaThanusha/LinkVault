// src/routes/auth.routes.js

const express = require('express')
const router = express.Router()
const passport = require('passport')
const authController = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} = require('../middleware/validate.middleware')
const { authLimiter, forgotPasswordLimiter } = require('../config/rateLimit')

// ─── EXISTING AUTH ROUTES ─────────────────────────────────────
router.post('/register', authLimiter, validateRegister, authController.register)
router.get('/verify-email', authController.verifyEmail)
router.post('/login', authLimiter, validateLogin, authController.login)
router.post('/refresh', authController.refreshToken)
router.post('/forgot-password', forgotPasswordLimiter, validateForgotPassword, authController.forgotPassword)
router.post('/reset-password', validateResetPassword, authController.resetPassword)
router.post('/logout', protect, authController.logout)
router.get('/me', protect, authController.getMe)

// ─── GOOGLE OAUTH ROUTES ──────────────────────────────────────

// STEP 1 of OAuth flow:
// User hits this URL → passport redirects them to Google
router.get('/google', authController.googleAuth)

// STEP 2 of OAuth flow:
// Google redirects back here after user approves
// passport.authenticate runs the strategy callback
// On success → req.user is set → googleCallback runs
// On failure → redirect to error page
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/auth-error`,
    session: false,           // We use JWT not sessions
  }),
  authController.googleCallback
)

module.exports = router