// src/index.js

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express')
const helmet = require('helmet')
const session = require('express-session')
const passport = require('./config/passport')       // ← Our passport config
const cors = require('cors')
const prisma = require('./config/prisma')
const authRoutes = require('./routes/auth.routes')
const bookmarkRoutes = require('./routes/bookmark.routes')
const { globalErrorHandler } = require('./middleware/error.middleware')
const { generalLimiter } = require('./config/rateLimit')

const app = express()

// ─── SECURITY MIDDLEWARE ──────────────────────────────────────
app.use(helmet())


const allowedOrigins = [
  "https://link-vault-theta-eight.vercel.app",
  "http://localhost:5173"
]

// ✅ SIMPLE + RELIABLE CONFIG
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// ✅ HANDLE PREFLIGHT MANUALLY (THIS FIXES YOUR 404)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', 'https://link-vault-theta-eight.vercel.app')
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.header('Access-Control-Allow-Credentials', 'true')
    return res.sendStatus(200) // 🔥 THIS IS THE KEY
  }
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(generalLimiter)

// ─── SESSION MIDDLEWARE ───────────────────────────────────────
// Required by passport for the OAuth redirect flow
// This is NOT your main auth — just temporary during Google login
app.use(session({
  secret: process.env.JWT_SECRET,     // Reuse your JWT secret
  resave: false,                      // Don't save if nothing changed
  saveUninitialized: false,           // Don't create empty sessions
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
    maxAge: 24 * 60 * 60 * 1000,     // 24 hours
  },
}))

// ─── PASSPORT MIDDLEWARE ──────────────────────────────────────
// Initialize passport AFTER session middleware
app.use(passport.initialize())
app.use(passport.session())

// ─── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/bookmarks', bookmarkRoutes)

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LinkVault API is running 🚀',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ─── 404 HANDLER ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  })
})

// ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
app.use(globalErrorHandler)

// ─── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000

app.listen(PORT, async () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  try {
    await prisma.$connect()
    console.log('✅ Database connected successfully')
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
    process.exit(1)
  }
})