// Navbar.jsx
// Top navigation bar shown on dashboard
// Shows logo, user name, and logout button

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      navigate('/login')
    } catch {
      navigate('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  // Get first letter of name for avatar
  const avatarLetter = user?.name?.charAt(0).toUpperCase() || 'U'

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-lg">🔖</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              LinkVault
            </span>
          </div>

          {/* Right side */}
          <div className="relative">
            {/* User Avatar Button */}
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Avatar Circle */}
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
                {avatarLetter}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.email || ''}
                </p>
              </div>
              {/* Dropdown arrow */}
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 mt-1"
                >
                  {loggingOut ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <span>🚪</span>
                      Logout
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </nav>
  )
}

export default Navbar