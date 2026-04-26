// src/config/passport.js
// This file configures HOW passport talks to Google
// and what to do when Google sends back user info

const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const prisma = require('./prisma')

// ─── GOOGLE STRATEGY ──────────────────────────────────────────
// This tells passport:
// 1. Here are my Google credentials
// 2. Here is what to do when Google sends user info back

passport.use(
  new GoogleStrategy(
    {
      // These come from your .env file
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,

      // This tells Google what info to send back
      // profile = name, picture
      // email = email address
      scope: ['profile', 'email'],
    },

    // This function runs AFTER Google confirms the user
    // Google calls this with the user's profile data
    // profile contains: id, displayName, emails, photos
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract what we need from Google's profile object
        const googleId = profile.id
        const email = profile.emails[0].value        // Primary email
        const name = profile.displayName             // Full name
        const isVerified = profile.emails[0].verified // Google verified?

        // ── SCENARIO 1: Find by Google ID (returning Google user) ──
        // This is the fastest check — googleId is unique
        let user = await prisma.user.findUnique({
          where: { googleId },
        })

        if (user) {
          // User found — they've logged in with Google before
          // Just return them — no changes needed
          return done(null, user)
        }

        // ── SCENARIO 2: Find by email (existing local account) ────
        // Maybe they registered with email+password before
        // and now they're trying Google with same email
        user = await prisma.user.findUnique({
          where: { email },
        })

        if (user) {
          // Found by email — link their Google account to existing account
          // Update their record to add googleId
          user = await prisma.user.update({
            where: { email },
            data: {
              googleId,                    // Link Google ID to their account
              provider: 'google',          // Update provider
              isEmailVerified: true,       // Google already verified this email
            },
          })
          return done(null, user)
        }

        // ── SCENARIO 3: Brand new user ────────────────────────────
        // Never seen this Google account OR email before
        // Create a completely new user
        user = await prisma.user.create({
          data: {
            googleId,
            email,
            name,
            provider: 'google',
            isEmailVerified: isVerified,  // Trust Google's verification
            password: null,               // No password for Google users
          },
        })

        return done(null, user)

      } catch (error) {
        // Something went wrong — pass error to passport
        return done(error, null)
      }
    }
  )
)

// ─── SERIALIZE / DESERIALIZE ──────────────────────────────────
// These are required by passport even though we use JWT
// They handle the temporary session during OAuth redirect flow
// Once we issue JWT tokens, session is no longer used

// Serialize: what to store in session (just the user ID)
passport.serializeUser((user, done) => {
  done(null, user.id)
})

// Deserialize: how to get user back from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport