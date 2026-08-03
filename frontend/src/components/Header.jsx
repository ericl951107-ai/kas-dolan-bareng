import { FiMenu, FiBell, FiMoon, FiSun, FiUser } from 'react-icons/fi'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function Header({ onMenuClick }) {
  const { isDark, toggleTheme } = useThemeStore()
  const { user } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)

  const getAvatarSrc = () => {
    if (!user?.avatar) return null
    if (user.avatar.startsWith('http')) return user.avatar
    return `${API_BASE}${user.avatar}`
  }

  const avatarSrc = getAvatarSrc()

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Right section */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            >
              {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <FiBell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold mb-3">Notifikasi</h3>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                      Belum ada notifikasi baru
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User profile */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <FiUser className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium">
                {user?.nickname || user?.name}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
