// useToast.js
// Custom hook that manages toast notifications
// Use this in any component to show toasts

import { useState, useCallback } from 'react'

function useToast() {
  const [toasts, setToasts] = useState([])

  // Add a new toast
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Shortcut methods
  const success = useCallback((msg) => showToast(msg, 'success'), [showToast])
  const error = useCallback((msg) => showToast(msg, 'error'), [showToast])
  const info = useCallback((msg) => showToast(msg, 'info'), [showToast])
  const warning = useCallback((msg) => showToast(msg, 'warning'), [showToast])

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  }
}

export default useToast