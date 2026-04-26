import { useEffect } from 'react'

// ── Single Toast Message ───────────────────
function ToastItem({ toast, onRemove }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 3000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warning: '⚠️',
  }

  const style = styles[toast.type] || styles.info
  const icon = icons[toast.type] || icons.info

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in max-w-sm w-full ${style}`}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-gray-400 hover:text-gray-600 flex-shrink-0 text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}

// ── Toast Container ────────────────────────
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

export default ToastContainer