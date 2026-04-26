// src/utils/email.utils.js

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// ─── VERIFICATION EMAIL ───────────────────────────────────────
const sendVerificationEmail = async (toEmail, userName, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Verify Your LinkVault Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to LinkVault! 🔖</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verificationUrl}"
           style="background-color: #4F46E5; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Verify Email Address
        </a>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <hr/>
        <small style="color: #999;">LinkVault — Smart Bookmark Manager</small>
      </div>
    `,
  })
}

// ─── PASSWORD RESET EMAIL ─────────────────────────────────────
const sendPasswordResetEmail = async (toEmail, userName, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Reset Your LinkVault Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Password Reset Request 🔐</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${resetUrl}"
           style="background-color: #DC2626; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
          Reset Password
        </a>
        <p>This link expires in <strong>1 hour</strong>.</p>
        <p>If you did not request a password reset, ignore this email. Your password will not change.</p>
        <hr/>
        <small style="color: #999;">LinkVault — Smart Bookmark Manager</small>
      </div>
    `,
  })
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
}