// src/services/auth.service.js
// All database operations and business logic for authentication

const bcrypt = require('bcryptjs')
const crypto = require('crypto')           // Built into Node.js — no install needed
const prisma = require('../config/prisma')
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt.utils')
// ✅ CORRECT — only ONE import line
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/email.utils')

// ─── REGISTER ─────────────────────────────────────────────────
const registerUser = async ({ name, email, password }) => {

  // 1. Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    throw new Error('Email already registered')
  }

  // 2. Hash the password — never store plain text
  // 12 = salt rounds (higher = more secure but slower)
  const hashedPassword = await bcrypt.hash(password, 12)

  // 3. Generate a random verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')

  // 4. Save user to database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      verificationToken,
    },
  })

  // 5. Send verification email
  await sendVerificationEmail(email, name, verificationToken)

  // 6. Return user without password
  const { password: _, verificationToken: __, ...safeUser } = user
  return safeUser
}

// ─── VERIFY EMAIL ─────────────────────────────────────────────
const verifyEmail = async (token) => {

  // Find user with this verification token
  const user = await prisma.user.findFirst({
    where: { verificationToken: token },
  })

  if (!user) {
    throw new Error('Invalid or expired verification token')
  }

  if (user.isEmailVerified) {
    throw new Error('Email is already verified')
  }

  // Update user — mark as verified and clear the token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isEmailVerified: true,
      verificationToken: null,    // Remove token after use
    },
  })

  return { message: 'Email verified successfully' }
}

// ─── LOGIN ────────────────────────────────────────────────────
const loginUser = async ({ email, password }) => {

  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  // 2. Check if email is verified
  if (!user.isEmailVerified) {
    throw new Error('Please verify your email before logging in')
  }

  // 3. Check if this is a Google account trying to use password login
if (user.provider === 'google' && !user.password) {
  throw new Error('This account uses Google login. Please sign in with Google.')
}

// 4. Compare entered password with hashed password in DB
const isPasswordValid = await bcrypt.compare(password, user.password)
if (!isPasswordValid) {
  throw new Error('Invalid email or password')
}

  // 4. Generate both tokens
  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // 5. Save refresh token to database (so we can invalidate on logout)
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  })

  // 6. Return tokens and safe user data
  const { password: _, verificationToken: __, refreshToken: ___, ...safeUser } = user

  return { accessToken, refreshToken, user: safeUser }
}

// ─── REFRESH TOKEN ────────────────────────────────────────────
const refreshAccessToken = async (refreshToken) => {

  if (!refreshToken) {
    throw new Error('Refresh token is required')
  }

  // 1. Verify the refresh token is valid (not expired, not tampered)
  const decoded = verifyRefreshToken(refreshToken)

  // 2. Find user and check their stored refresh token matches
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

  if (!user || user.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token')
  }

  // 3. Generate new access token
  const newAccessToken = generateAccessToken(user.id)

  return { accessToken: newAccessToken }
}

// ─── LOGOUT ───────────────────────────────────────────────────
const logoutUser = async (userId) => {

  // Remove refresh token from DB — this invalidates it
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  })

  return { message: 'Logged out successfully' }
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────
const forgotPassword = async (email) => {

  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } })

  // IMPORTANT: Always return same message whether email exists or not
  // Why? Security — don't reveal which emails are registered
  if (!user) {
    return { message: 'If this email is registered, a reset link has been sent.' }
  }

  // 2. Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')

  // 3. Set expiry — 1 hour from now
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000)
  // Date.now() = current time in milliseconds
  // 60 * 60 * 1000 = 1 hour in milliseconds

  // 4. Save token and expiry to database
  await prisma.user.update({
    where: { email },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetExpiry,
    },
  })

  // 5. Send reset email
  await sendPasswordResetEmail(email, user.name, resetToken)

  return { message: 'If this email is registered, a reset link has been sent.' }
}

// ─── RESET PASSWORD ───────────────────────────────────────────
const resetPassword = async (token, newPassword) => {

  // 1. Find user with this token
  const user = await prisma.user.findFirst({
    where: { resetPasswordToken: token },
  })

  if (!user) {
    throw new Error('Invalid or expired reset token')
  }

  // 2. Check if token has expired
  if (!user.resetPasswordExpiry || user.resetPasswordExpiry < new Date()) {
    throw new Error('Invalid or expired reset token')
  }

  // 3. Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 12)

  // 4. Update password and clear reset token fields
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,    // Clear token after use
      resetPasswordExpiry: null,   // Clear expiry after use
      refreshToken: null,          // Logout all devices after password change
    },
  })

  return { message: 'Password reset successfully. Please login with your new password.' }
}

// ─── GET CURRENT USER ─────────────────────────────────────────
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isEmailVerified: true,
      createdAt: true,
      // Count their bookmarks
      _count: {
        select: { bookmarks: true }
      }
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return user
}

// ─── GOOGLE LOGIN ─────────────────────────────────────────────
// Called after passport successfully gets user from Google
// Generates our JWT tokens — same as normal login
const googleLogin = async (user) => {

  // Generate our own JWT tokens
  // This is IDENTICAL to regular login — same token system
  const accessToken = generateAccessToken(user.id)
  const refreshToken = generateRefreshToken(user.id)

  // Save refresh token to database (same as regular login)
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  })

  // Return clean user data + tokens
  const { 
    password,
    verificationToken,
    refreshToken: _,
    resetPasswordToken,
    resetPasswordExpiry,
    ...safeUser 
  } = user

  return { accessToken, refreshToken, user: safeUser }
}

module.exports = {
  registerUser,
  verifyEmail,
  loginUser,
  refreshAccessToken,
  logoutUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  googleLogin,        // ← ADD THIS
}