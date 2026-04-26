// src/routes/bookmark.routes.js

const express = require('express')
const router = express.Router()
const bookmarkController = require('../controllers/bookmark.controller')
const { protect } = require('../middleware/auth.middleware')
const {
  validateCreateBookmark,
  validateUpdateBookmark,
} = require('../middleware/validate.middleware')

router.use(protect)

router.get('/search', bookmarkController.searchBookmarks)
router.post('/', validateCreateBookmark, bookmarkController.createBookmark)
router.get('/', bookmarkController.getAllBookmarks)
router.get('/:id', bookmarkController.getBookmarkById)
router.put('/:id', validateUpdateBookmark, bookmarkController.updateBookmark)
router.delete('/:id', bookmarkController.deleteBookmark)
router.patch('/:id/favorite', bookmarkController.toggleFavorite)

module.exports = router