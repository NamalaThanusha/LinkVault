// src/controllers/bookmark.controller.js
// Handles HTTP requests and responses for bookmarks

const bookmarkService = require('../services/bookmark.service')
const { successResponse, errorResponse } = require('../utils/response.utils')

// POST /api/bookmarks
const createBookmark = async (req, res) => {
  try {
    const { title, url, description, tags } = req.body

    // Validation
    if (!title || !url) {
      return errorResponse(res, 400, 'Title and URL are required')
    }

    // Basic URL format check
    try {
      new URL(url)    // Built-in JS URL parser — throws if invalid
    } catch {
      return errorResponse(res, 400, 'Please provide a valid URL')
    }

    // tags should be an array if provided
    if (tags && !Array.isArray(tags)) {
      return errorResponse(res, 400, 'Tags must be an array of strings')
    }

    // req.user.userId comes from auth middleware
    const bookmark = await bookmarkService.createBookmark(req.user.userId, {
      title,
      url,
      description,
      tags,
    })

    return successResponse(res, 201, 'Bookmark created successfully', { bookmark })

  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to create bookmark')
  }
}

// GET /api/bookmarks?page=1&limit=10&favorite=true
const getAllBookmarks = async (req, res) => {
  try {
    const { page, limit, favorite } = req.query

    const result = await bookmarkService.getAllBookmarks(req.user.userId, {
      page,
      limit,
      favorite,
    })

    return successResponse(res, 200, 'Bookmarks retrieved successfully', result)

  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to get bookmarks')
  }
}

// GET /api/bookmarks/:id
const getBookmarkById = async (req, res) => {
  try {
    const bookmark = await bookmarkService.getBookmarkById(
      req.user.userId,
      req.params.id        // :id from URL
    )

    return successResponse(res, 200, 'Bookmark retrieved successfully', { bookmark })

  } catch (error) {
    if (error.message === 'Bookmark not found') {
      return errorResponse(res, 404, error.message)
    }
    return errorResponse(res, 500, error.message || 'Failed to get bookmark')
  }
}

// PUT /api/bookmarks/:id
const updateBookmark = async (req, res) => {
  try {
    const { title, url, description, tags } = req.body

    if (url) {
      try {
        new URL(url)
      } catch {
        return errorResponse(res, 400, 'Please provide a valid URL')
      }
    }

    if (tags && !Array.isArray(tags)) {
      return errorResponse(res, 400, 'Tags must be an array of strings')
    }

    const bookmark = await bookmarkService.updateBookmark(
      req.user.userId,
      req.params.id,
      { title, url, description, tags }
    )

    return successResponse(res, 200, 'Bookmark updated successfully', { bookmark })

  } catch (error) {
    if (error.message === 'Bookmark not found') {
      return errorResponse(res, 404, error.message)
    }
    return errorResponse(res, 500, error.message || 'Failed to update bookmark')
  }
}

// DELETE /api/bookmarks/:id
const deleteBookmark = async (req, res) => {
  try {
    const result = await bookmarkService.deleteBookmark(
      req.user.userId,
      req.params.id
    )

    return successResponse(res, 200, result.message)

  } catch (error) {
    if (error.message === 'Bookmark not found') {
      return errorResponse(res, 404, error.message)
    }
    return errorResponse(res, 500, error.message || 'Failed to delete bookmark')
  }
}

// PATCH /api/bookmarks/:id/favorite
const toggleFavorite = async (req, res) => {
  try {
    const bookmark = await bookmarkService.toggleFavorite(
      req.user.userId,
      req.params.id
    )

    return successResponse(res, 200, 'Favorite toggled successfully', { bookmark })

  } catch (error) {
    if (error.message === 'Bookmark not found') {
      return errorResponse(res, 404, error.message)
    }
    return errorResponse(res, 500, error.message || 'Failed to toggle favorite')
  }
}

// GET /api/bookmarks/search?q=react&page=1
const searchBookmarks = async (req, res) => {
  try {
    const { q, page, limit } = req.query

    const result = await bookmarkService.searchBookmarks(
      req.user.userId,
      { q, page, limit }
    )

    return successResponse(res, 200, 'Search results retrieved', result)

  } catch (error) {
    if (error.message === 'Search query is required') {
      return errorResponse(res, 400, error.message)
    }
    return errorResponse(res, 500, error.message || 'Search failed')
  }
}

module.exports = {
  createBookmark,
  getAllBookmarks,
  getBookmarkById,
  updateBookmark,
  deleteBookmark,
  toggleFavorite,
  searchBookmarks,
}