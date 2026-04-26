// Button.jsx
// A reusable button used across all pages
// Handles loading state, disabled state, and different styles

function Button({
  children,   // button text or content
  onClick,    // function to call on click
  type,       // "button", "submit"
  loading,    // show spinner when true
  disabled,   // disable button
  variant,    // "primary", "secondary", "google"
  fullWidth,  // make button full width
}) {

  // Different styles for different button types
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800',
    google: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  }

  const selectedVariant = variants[variant] || variants.primary

  return (
    <button
      type={type || 'button'}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center justify-center gap-2
        px-4 py-3 rounded-lg font-medium text-sm
        transition-all duration-200
        disabled:opacity-60 disabled:cursor-not-allowed
        ${selectedVariant}
        ${fullWidth ? 'w-full' : ''}
      `}
    >
      {/* Show spinner when loading */}
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}

export default Button