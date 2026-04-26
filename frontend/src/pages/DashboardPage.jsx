import { useState, useEffect, useCallback } from 'react'
import Navbar from '../components/Navbar'
import BookmarkCard from '../components/BookmarkCard'
import BookmarkModal from '../components/BookmarkModal'
import ToastContainer from '../components/Toast'
import useToast from '../hooks/useToast'
import Button from '../components/Button'
import {
  getAllBookmarks,
  searchBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  toggleFavorite,
} from '../api/bookmarkApi'

function DashboardPage() {

  // ── State ──────────────────────────────────
  const [bookmarks, setBookmarks] = useState([])
  const [allBookmarks, setAllBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalLoading, setModalLoading] = useState(false)
  const [error, setError] = useState('')

  // Search
  const [searchInput, setSearchInput] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  // Filters
  const [activeTag, setActiveTag] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [allTags, setAllTags] = useState([])

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 9

  // Modal
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  // Delete
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Toast notifications
  const toast = useToast()

  // ── Extract tags helper ───────────────────
  const extractTags = (list) => {
    const tagSet = new Set()
    list.forEach(b => {
      b.tags?.forEach(t => {
        const name = t?.tag?.name || t?.name || (typeof t === 'string' ? t : null)
        if (name) tagSet.add(name)
      })
    })
    return [...tagSet]
  }

  // ── Apply filters locally ─────────────────
  const applyFilters = useCallback((list, tag, favOnly) => {
    let filtered = [...list]
    if (tag) {
      filtered = filtered.filter(b =>
        b.tags?.some(t => {
          const name = t?.tag?.name || t?.name || (typeof t === 'string' ? t : '')
          return name === tag
        })
      )
    }
    if (favOnly) {
      filtered = filtered.filter(b => b.isFavorite)
    }
    return filtered
  }, [])

  // ── Fetch Bookmarks ───────────────────────
  const fetchBookmarks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAllBookmarks({ page, limit: LIMIT })
      const data = response?.data?.data || {}
      const list = Array.isArray(data.bookmarks) ? data.bookmarks : []

      setAllBookmarks(list)
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || list.length)
      setAllTags(extractTags(list))

      const filtered = applyFilters(list, activeTag, showFavoritesOnly)
      setBookmarks(filtered)

    } catch (err) {
      console.log('Fetch error:', err)
      setError('Failed to load bookmarks. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [page, activeTag, showFavoritesOnly, applyFilters])

  useEffect(() => {
    if (!isSearchMode) fetchBookmarks()
  }, [fetchBookmarks, isSearchMode])

  // ── Search ────────────────────────────────
  const handleSearch = async (e) => {
    e?.preventDefault()
    const query = searchInput.trim()
    if (!query) { handleClearSearch(); return }

    setLoading(true)
    setError('')
    setIsSearchMode(true)
    setActiveTag('')
    setShowFavoritesOnly(false)

    try {
      const response = await searchBookmarks(query, 1, 100)
      const data = response?.data?.data || {}
      const list = Array.isArray(data.bookmarks) ? data.bookmarks : []
      setBookmarks(list)
      setTotal(list.length)
      setTotalPages(1)
      setAllTags(extractTags(list))
    } catch (err) {
      console.log('Search error:', err)
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setIsSearchMode(false)
    setActiveTag('')
    setShowFavoritesOnly(false)
    setPage(1)
  }

  // ── Tag Filter ────────────────────────────
  const handleTagFilter = (tag) => {
    setActiveTag(tag)
    setIsSearchMode(false)
    setSearchInput('')
    setShowFavoritesOnly(false)
    setPage(1)
    const filtered = applyFilters(allBookmarks, tag, false)
    setBookmarks(filtered)
    setTotal(filtered.length)
  }

  // ── Favorites Filter ──────────────────────
  const handleFavoritesFilter = () => {
    const newVal = !showFavoritesOnly
    setShowFavoritesOnly(newVal)
    setActiveTag('')
    setIsSearchMode(false)
    setSearchInput('')
    setPage(1)
    const filtered = applyFilters(allBookmarks, '', newVal)
    setBookmarks(filtered)
    setTotal(filtered.length)
  }

  // ── Add Bookmark ──────────────────────────
  const handleAddBookmark = async (data) => {
    setModalLoading(true)
    try {
      await createBookmark(data)
      setModalOpen(false)
      setIsSearchMode(false)
      setSearchInput('')
      setActiveTag('')
      setShowFavoritesOnly(false)
      setPage(1)
      await fetchBookmarks()
      toast.success('Bookmark added successfully! 🎉')
    } catch (err) {
      console.log('Add error:', err?.response?.data)
      toast.error(err?.response?.data?.message || 'Failed to add bookmark')
    } finally {
      setModalLoading(false)
    }
  }

  // ── Edit Bookmark ─────────────────────────
  const handleEditBookmark = async (data) => {
    setModalLoading(true)
    try {
      await updateBookmark(editData.id, data)
      setModalOpen(false)
      setEditData(null)
      await fetchBookmarks()
      toast.success('Bookmark updated successfully! ✏️')
    } catch (err) {
      console.log('Edit error:', err?.response?.data)
      toast.error(err?.response?.data?.message || 'Failed to update bookmark')
    } finally {
      setModalLoading(false)
    }
  }

  // ── Delete Bookmark ───────────────────────
  const handleDelete = async (id) => {
    setDeleteLoading(true)
    try {
      await deleteBookmark(id)
      setDeleteId(null)
      setBookmarks(prev => prev.filter(b => b.id !== id))
      setAllBookmarks(prev => prev.filter(b => b.id !== id))
      setTotal(prev => prev - 1)
      toast.success('Bookmark deleted! 🗑️')
    } catch (err) {
      console.log('Delete error:', err)
      toast.error('Failed to delete bookmark')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Toggle Favorite ───────────────────────
  const handleToggleFavorite = async (id) => {
    try {
      await toggleFavorite(id)
      const updater = list => list.map(b =>
        b.id === id ? { ...b, isFavorite: !b.isFavorite } : b
      )
      setBookmarks(updater)
      setAllBookmarks(updater)

      const bookmark = allBookmarks.find(b => b.id === id)
      if (bookmark) {
        toast.info(bookmark.isFavorite ? 'Removed from favorites' : '⭐ Added to favorites!')
      }

      // If showing favorites only and unfavorited → remove from view
      if (showFavoritesOnly) {
        setBookmarks(prev => prev.filter(b => {
          if (b.id === id) return !b.isFavorite
          return true
        }))
      }
    } catch (err) {
      console.log('Favorite error:', err)
      toast.error('Failed to update favorite')
    }
  }

  // ── Modal helpers ─────────────────────────
  const openEditModal = (bookmark) => {
    setEditData({ ...bookmark })
    setModalOpen(true)
  }

  const openAddModal = () => {
    setEditData(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setTimeout(() => setEditData(null), 200)
  }

  // ── UI ────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookmarks</h1>
            <p className="text-sm text-gray-500 mt-1">
              {showFavoritesOnly
                ? `${total} favorite${total !== 1 ? 's' : ''}`
                : isSearchMode
                ? `${total} result${total !== 1 ? 's' : ''} found`
                : `${total} bookmark${total !== 1 ? 's' : ''} saved`
              }
            </p>
          </div>
          <Button onClick={openAddModal}>
            ➕ Add Bookmark
          </Button>
        </div>

        {/* ── Search Bar ── */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search bookmarks by title, URL, description or tags..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          {(isSearchMode || searchInput) && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        {/* ── Search Results Badge ── */}
        {isSearchMode && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Results for:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              "{searchInput}"
            </span>
          </div>
        )}

        {/* ── Filter Bar ── */}
        <div className="flex flex-wrap gap-2 mb-6">

          {/* Favorites Filter Button */}
          <button
            onClick={handleFavoritesFilter}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors flex items-center gap-1.5 ${
              showFavoritesOnly
                ? 'bg-yellow-400 text-yellow-900 border-yellow-400'
                : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-300'
            }`}
          >
            ⭐ Favorites
          </button>

          {/* All Tags button */}
          {allTags.length > 0 && (
            <button
              onClick={() => handleTagFilter('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === '' && !showFavoritesOnly && !isSearchMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              All
            </button>
          )}

          {/* Individual Tag Buttons */}
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagFilter(tag)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTag === tag
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            ❌ {error}
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Loading bookmarks...</p>
          </div>

        ) : bookmarks.length === 0 ? (

          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">
              {showFavoritesOnly ? '⭐' : '🔖'}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {showFavoritesOnly
                ? 'No favorites yet'
                : isSearchMode || activeTag
                ? 'No bookmarks found'
                : 'No bookmarks yet'
              }
            </h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              {showFavoritesOnly
                ? 'Click the ☆ star on any bookmark to add it to favorites'
                : isSearchMode
                ? 'Try different search keywords'
                : activeTag
                ? `No bookmarks with tag #${activeTag}`
                : 'Start saving your favorite links!'
              }
            </p>
            {!isSearchMode && !activeTag && !showFavoritesOnly && (
              <Button onClick={openAddModal}>
                ➕ Add Your First Bookmark
              </Button>
            )}
            {(isSearchMode || activeTag || showFavoritesOnly) && (
              <button
                onClick={handleClearSearch}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                ← Back to all bookmarks
              </button>
            )}
          </div>

        ) : (

          /* ── Bookmarks Grid ── */
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {bookmarks.map((bookmark, index) => (
                <BookmarkCard
                  key={bookmark.id || index}
                  bookmark={bookmark}
                  onEdit={openEditModal}
                  onDelete={id => setDeleteId(id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* ── Pagination ── */}
            {!isSearchMode && !activeTag && !showFavoritesOnly && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((item, idx) =>
                    item === '...' ? (
                      <span key={`dots-${idx}`} className="text-gray-400 px-1">...</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          item === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      <BookmarkModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={editData ? handleEditBookmark : handleAddBookmark}
        editData={editData}
        loading={modalLoading}
      />

      {/* ── Delete Confirmation ── */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Bookmark?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleteLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast Notifications ── */}
      <ToastContainer
        toasts={toast.toasts}
        onRemove={toast.removeToast}
      />

    </div>
  )
}

export default DashboardPage