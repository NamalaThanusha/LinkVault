function BookmarkCard({ bookmark, onEdit, onDelete, onToggleFavorite }) {

  // 🛡️ Safety check (prevents crash)
  if (!bookmark || typeof bookmark !== 'object') return null

  const getFavicon = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return null
    }
  }

  const shortUrl = (url) => {
    try {
      const { hostname, pathname } = new URL(url)
      const path = pathname.length > 20
        ? pathname.substring(0, 20) + '...'
        : pathname
      return hostname + path
    } catch {
      return url
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col gap-3 group">

      {/* Top */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">

          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {getFavicon(bookmark.url) ? (
              <img
                src={getFavicon(bookmark.url)}
                alt=""
                className="w-5 h-5"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <span className="text-gray-400 text-xs">🔗</span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {bookmark.title || 'Untitled'}
          </h3>
        </div>

        <button
          onClick={() => onToggleFavorite(bookmark.id)}
          className="flex-shrink-0 text-lg hover:scale-110 transition-transform"
          title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {bookmark.isFavorite ? '⭐' : '☆'}
        </button>
      </div>

      {/* URL */}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:text-blue-700 hover:underline truncate block"
      >
        🔗 {shortUrl(bookmark.url)}
      </a>

      {/* Description */}
      {bookmark.description && (
        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
          {bookmark.description}
        </p>
      )}

      {/* ✅ FIXED TAGS SECTION */}
      {Array.isArray(bookmark.tags) && bookmark.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {bookmark.tags.map((tagObj, index) => {

            let tagName = null

            if (typeof tagObj === 'string') {
              tagName = tagObj
            } else if (tagObj?.tag?.name && typeof tagObj.tag.name === 'string') {
              tagName = tagObj.tag.name
            } else if (tagObj?.name && typeof tagObj.name === 'string') {
              tagName = tagObj.name
            }

            // 🛑 Skip invalid values
            if (!tagName) return null

            return (
              <span
                key={`${tagName}-${index}`}
                className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium"
              >
                #{tagName}
              </span>
            )
          })}
        </div>
      )}

      {/* Bottom */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <span className="text-xs text-gray-400">
          {new Date(bookmark.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(bookmark)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit bookmark"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(bookmark.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete bookmark"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  )
}

export default BookmarkCard