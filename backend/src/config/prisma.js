// src/config/prisma.js

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')

// DATABASE_URL uses connection pooling — for all normal queries
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in your .env file')
}

// Create pg connection pool
const pool = new pg.Pool({ connectionString })

// Create Prisma adapter using the pool
const adapter = new PrismaPg(pool)

const globalForPrisma = global

// Create PrismaClient with adapter — required for Prisma 7
const prisma = globalForPrisma.prisma || new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development'
    ? ['error', 'warn']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

module.exports = prisma