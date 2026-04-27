// src/index.js

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const helmet = require('helmet')
const session = require('express-session')
const cors = require('cors')

const prisma = require('./config/prisma')
const passport = require('./config/passport')
const authRoutes = require('./routes/auth.routes')
const bookmarkRoutes = require('./routes/bookmark.routes')
const { globalErrorHandler } = require('./middleware/error.middleware')
const { generalLimiter } = require('./config/rateLimit')

const app = express()

const normalizeOrigin = (origin) => origin.trim().replace(/\/+$/, '')

const getAllowedOrigins = () => {
  const defaultOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]

  const envOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.FRONTEND_ORIGIN,
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ]

  return new Set(
    [...defaultOrigins, ...envOrigins]
      .filter(Boolean)
      .map(normalizeOrigin)
  )
}

const allowedOrigins = getAllowedOrigins()

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (Postman/cURL) and same-origin calls.
    if (!origin) {
      return callback(null, true)
    }

    const normalizedOrigin = normalizeOrigin(origin)
    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true)
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
}

app.set('trust proxy', 1)

// ─── SECURITY + CORE MIDDLEWARE ──────────────────────────────
app.use(helmet())
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(generalLimiter)

// ─── SESSION + PASSPORT (required for OAuth handshake) ───────
app.use(
  session({
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    proxy: process.env.NODE_ENV === 'production',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())

// ─── ROUTES ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/bookmarks', bookmarkRoutes)

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'LinkVault API is running',
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
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
  try {
    await prisma.$connect()
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Database connection failed:', error.message)
    process.exit(1)
  }
})