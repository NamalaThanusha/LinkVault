import { useState } from 'react'

// Converts tags array → comma string for the input field
function getTagsString(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return ''
  return tags
    .map(function(t) {
      if (typeof t === 'string') return t
      if (t && t.tag && t.tag.name) return t.tag.name
      if (t && t.name) return t.name
      return ''
    })
    .filter(function(t) { return t !== '' })
    .join(', ')
}

// ✅ Inner form component
// Gets a NEW key every time modal opens
// So useState initializes fresh with correct data every time
function ModalInner({ onClose, onSubmit, editData, loading }) {

  const isEdit = !!(editData && editData.id)

  const [title, setTitle] = useState(isEdit ? (editData.title || '') : '')
  const [url, setUrl] = useState(isEdit ? (editData.url || '') : '')
  const [description, setDescription] = useState(isEdit ? (editData.description || '') : '')
  const [tags, setTags] = useState(isEdit ? getTagsString(editData.tags) : '')
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!url.trim()) {
      newErrors.url = 'URL is required'
    } else if (!url.trim().startsWith('http://') && !url.trim().startsWith('https://')) {
      newErrors.url = 'URL must start with http:// or https://'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    const tagsArray = tags
      ? tags.split(',').map(t => t.trim()).filter(t => t !== '')
      : []
    onSubmit({
      title: title.trim(),
      url: url.trim(),
      description: description.trim(),
      tags: tagsArray,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? '✏️ Edit Bookmark' : '➕ Add Bookmark'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => {
                setTitle(e.target.value)
                if (errors.title) setErrors(p => ({...p, title: ''}))
              }}
              placeholder="e.g. React Documentation"
              disabled={loading}
              className={
                errors.title
                  ? 'w-full px-4 py-3 rounded-lg border border-red-400 bg-red-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100'
                  : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
              }
            />
            {errors.title && (
              <p className="text-xs text-red-500">⚠️ {errors.title}</p>
            )}
          </div>

          {/* URL */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={e => {
                setUrl(e.target.value)
                if (errors.url) setErrors(p => ({...p, url: ''}))
              }}
              placeholder="https://example.com"
              disabled={loading}
              className={
                errors.url
                  ? 'w-full px-4 py-3 rounded-lg border border-red-400 bg-red-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100'
                  : 'w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100'
              }
            />
            {errors.url && (
              <p className="text-xs text-red-500">⚠️ {errors.url}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Description{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this bookmark about?"
              disabled={loading}
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-100"
            />
          </div>

          {/* Tags */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Tags{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="react, javascript, tutorial"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <p className="text-xs text-gray-400">
              💡 Separate multiple tags with commas
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {isEdit ? 'Save Changes' : 'Add Bookmark'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ✅ Outer wrapper — controls the KEY
// key changes every time editData changes
// This forces ModalInner to remount with fresh useState values
function BookmarkModal({ isOpen, onClose, onSubmit, editData, loading }) {
  if (!isOpen) return null

  return (
    <ModalInner
      key={editData ? editData.id : 'new-bookmark'}
      onClose={onClose}
      onSubmit={onSubmit}
      editData={editData}
      loading={loading}
    />
  )
}

export default BookmarkModal