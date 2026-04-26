// src/middleware/error.middleware.js
// Global error handler — catches any unhandled errors in the app

const { errorResponse } = require('../utils/response.utils')

const globalErrorHandler = (err, req, res, next) => {
  console.error('❌ Unhandled Error:', err)

  // Prisma specific errors
  if (err.code === 'P2002') {
    return errorResponse(res, 409, 'A record with this value already exists.')
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'Record not found.')
  }

  const statusCode = err.statusCode || 500
  const message = err.message || 'Internal server error'

  return errorResponse(res, statusCode, message)
}

module.exports = { globalErrorHandler }