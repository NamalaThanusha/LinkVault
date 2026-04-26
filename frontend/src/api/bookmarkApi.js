import api from './axiosInstance'

// ── Create bookmark ────────────────────────
export const createBookmark = (data) => {
  return api.post('/bookmarks', data)
}

// ── Get all bookmarks ──────────────────────
// Backend only accepts: page, limit, favorite
export const getAllBookmarks = (params) => {
  const cleanParams = {}
  if (params?.page) cleanParams.page = params.page
  if (params?.limit) cleanParams.limit = params.limit
  if (params?.favorite) cleanParams.favorite = params.favorite
  return api.get('/bookmarks', { params: cleanParams })
}

// ── Search bookmarks (separate endpoint) ───
// Backend: GET /bookmarks/search?q=react
export const searchBookmarks = (q, page = 1, limit = 9) => {
  return api.get('/bookmarks/search', {
    params: { q, page, limit }
  })
}

// ── Get single bookmark ────────────────────
export const getBookmark = (id) => {
  return api.get(`/bookmarks/${id}`)
}

// ── Update bookmark ────────────────────────
export const updateBookmark = (id, data) => {
  return api.put(`/bookmarks/${id}`, data)
}

// ── Delete bookmark ────────────────────────
export const deleteBookmark = (id) => {
  return api.delete(`/bookmarks/${id}`)
}

// ── Toggle favorite ────────────────────────
export const toggleFavorite = (id) => {
  return api.patch(`/bookmarks/${id}/favorite`)
}