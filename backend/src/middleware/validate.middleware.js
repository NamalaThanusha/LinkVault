// src/middleware/validate.middleware.js

const { body, validationResult } = require('express-validator')
const { errorResponse } = require('../utils/response.utils')

// This function runs after validation rules
// It checks if any rules failed and returns errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }))

    return errorResponse(res, 400, 'Validation failed', errorMessages)
  }

  next()
}

// ─── AUTH VALIDATORS ──────────────────────────────────────────

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  handleValidationErrors,
]

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),

  handleValidationErrors,
]

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email'),

  handleValidationErrors,
]

const validateResetPassword = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),

  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  handleValidationErrors,
]

// ─── BOOKMARK VALIDATORS ──────────────────────────────────────

const validateCreateBookmark = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('url')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL starting with http:// or https://'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 }).withMessage('Each tag must be 1-30 characters'),

  handleValidationErrors,
]

const validateUpdateBookmark = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('url')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => tags.length <= 10).withMessage('Maximum 10 tags allowed'),

  handleValidationErrors,
]

module.exports = {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateCreateBookmark,
  validateUpdateBookmark,
}