// src/services/bookmark.service.js
// All database operations for bookmarks

const prisma = require('../config/prisma')

// ─── HELPER: Process Tags ──────────────────────────────────────
// This helper finds or creates tags and returns their IDs
// Why? Tags are shared — "javascript" tag should exist only ONCE
// even if 100 bookmarks use it
const processTagNames = async (tagNames) => {
  if (!tagNames || tagNames.length === 0) return []

  const tags = await Promise.all(
    tagNames.map(async (name) => {
      const tagName = name.toLowerCase().trim() // normalize: "JavaScript" → "javascript"

      // findOrCreate pattern:
      // If tag exists → return it
      // If tag doesn't exist → create it
      return await prisma.tag.upsert({
        where: { name: tagName },
        update: {},              // Don't change anything if it exists
        create: { name: tagName }, // Create if it doesn't exist
      })
    })
  )

  return tags.map((tag) => ({ tagId: tag.id }))
}

// ─── CREATE BOOKMARK ──────────────────────────────────────────
const createBookmark = async (userId, { title, url, description, tags }) => {

  // Process tags first — get their IDs
  const tagConnections = await processTagNames(tags)

  const bookmark = await prisma.bookmark.create({
    data: {
      title,
      url,
      description: description || null,
      userId,                            // Link bookmark to logged-in user
      tags: {
        create: tagConnections,          // Create BookmarkTag join records
      },
    },
    include: {
      tags: {
        include: {
          tag: true,                     // Include full tag data in response
        },
      },
    },
  })

  return formatBookmark(bookmark)        // Clean up response shape
}

// ─── GET ALL BOOKMARKS (with pagination) ──────────────────────
const getAllBookmarks = async (userId, { page = 1, limit = 10, favorite }) => {

  // Convert to numbers — query params come as strings
  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum
  // Page 1 → skip 0  (start from beginning)
  // Page 2 → skip 10 (skip first 10)
  // Page 3 → skip 20 (skip first 20)

  // Build filter object
  const where = { userId }                          // Always filter by logged-in user

  if (favorite === 'true') {
    where.isFavorite = true                         // Optional: only favorites
  }

  // Run both queries at the same time for efficiency
  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },               // Newest first
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.bookmark.count({ where }),               // Total count for pagination
  ])

  return {
    bookmarks: bookmarks.map(formatBookmark),
    pagination: {
      total,                                        // Total bookmarks
      page: pageNum,                                // Current page
      limit: limitNum,                              // Items per page
      totalPages: Math.ceil(total / limitNum),      // Total pages
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  }
}

// ─── GET ONE BOOKMARK ─────────────────────────────────────────
const getBookmarkById = async (userId, bookmarkId) => {

  const bookmark = await prisma.bookmark.findFirst({
    where: {
      id: bookmarkId,
      userId,           // IMPORTANT: ensure bookmark belongs to THIS user
    },
    include: {
      tags: { include: { tag: true } },
    },
  })

  if (!bookmark) {
    throw new Error('Bookmark not found')
  }

  return formatBookmark(bookmark)
}

// ─── UPDATE BOOKMARK ──────────────────────────────────────────
const updateBookmark = async (userId, bookmarkId, { title, url, description, tags }) => {

  // First check bookmark exists and belongs to this user
  const existing = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, userId },
  })

  if (!existing) {
    throw new Error('Bookmark not found')
  }

  // Process new tags if provided
  const tagConnections = tags ? await processTagNames(tags) : null

  const bookmark = await prisma.bookmark.update({
    where: { id: bookmarkId },
    data: {
      // Only update fields that were actually sent
      // undefined fields are ignored by Prisma
      ...(title && { title }),
      ...(url && { url }),
      ...(description !== undefined && { description }),

      // If new tags provided → delete old connections → add new ones
      ...(tagConnections && {
        tags: {
          deleteMany: {},              // Remove all existing tag connections
          create: tagConnections,      // Add new ones
        },
      }),
    },
    include: {
      tags: { include: { tag: true } },
    },
  })

  return formatBookmark(bookmark)
}

// ─── DELETE BOOKMARK ──────────────────────────────────────────
const deleteBookmark = async (userId, bookmarkId) => {

  // Check bookmark exists and belongs to this user
  const existing = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, userId },
  })

  if (!existing) {
    throw new Error('Bookmark not found')
  }

  await prisma.bookmark.delete({
    where: { id: bookmarkId },
  })

  return { message: 'Bookmark deleted successfully' }
}

// ─── TOGGLE FAVORITE ──────────────────────────────────────────
const toggleFavorite = async (userId, bookmarkId) => {

  const existing = await prisma.bookmark.findFirst({
    where: { id: bookmarkId, userId },
  })

  if (!existing) {
    throw new Error('Bookmark not found')
  }

  // Flip the current value: true → false, false → true
  const bookmark = await prisma.bookmark.update({
    where: { id: bookmarkId },
    data: { isFavorite: !existing.isFavorite },
    include: {
      tags: { include: { tag: true } },
    },
  })

  return formatBookmark(bookmark)
}

// ─── SEARCH BOOKMARKS ─────────────────────────────────────────
const searchBookmarks = async (userId, { q, page = 1, limit = 10 }) => {

  if (!q || q.trim() === '') {
    throw new Error('Search query is required')
  }

  const pageNum = parseInt(page)
  const limitNum = parseInt(limit)
  const skip = (pageNum - 1) * limitNum

  const where = {
    userId,
    OR: [
      // Search in title (case-insensitive)
      { title: { contains: q, mode: 'insensitive' } },
      // Search in URL
      { url: { contains: q, mode: 'insensitive' } },
      // Search in description
      { description: { contains: q, mode: 'insensitive' } },
      // Search in tag names
      {
        tags: {
          some: {
            tag: {
              name: { contains: q, mode: 'insensitive' },
            },
          },
        },
      },
    ],
  }

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.bookmark.count({ where }),
  ])

  return {
    bookmarks: bookmarks.map(formatBookmark),
    query: q,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
    },
  }
}

// ─── HELPER: Format Bookmark ───────────────────────────────────
// Cleans up the Prisma response shape for the client
// Prisma returns tags as: [{ tagId: "x", bookmarkId: "y", tag: { id: "x", name: "js" } }]
// We want:               [{ id: "x", name: "js" }]
const formatBookmark = (bookmark) => {
  return {
    ...bookmark,
    tags: bookmark.tags.map((bt) => ({
      id: bt.tag.id,
      name: bt.tag.name,
    })),
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