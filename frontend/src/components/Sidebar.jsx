import { NavLink } from 'react-router-dom'
import { 
  FiHome, FiUsers, FiDollarSign, FiClock, 
  FiTrendingDown, FiBarChart2, FiSettings, FiX 
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'

const menuItems = [
  { path: '/', icon: FiHome, label: 'Beranda' },
  { path: '/members', icon: FiUsers, label: 'Anggota' },
  { path: '/payment', icon: FiDollarSign, label: 'Bayar Kas' },
  { path: '/history', icon: FiClock, label: 'Riwayat' },
  { path: '/expenses', icon: FiTrendingDown, label: 'Pengeluaran' },
  { path: '/statistics', icon: FiBarChart2, label: 'Statistik' },
]

const adminMenuItems = [
  { path: '/settings', icon: FiSettings, label: 'Pengaturan', adminOnly: true },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <FiDollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Kas Dolan
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Bareng
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="md:hidden p-1 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => {
                  if (window.innerWidth < 768) onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {/* Admin Only Menu */}
            {isAdmin && (
              <>
                <div className="pt-4 pb-2">
                  <div className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Admin
                  </div>
                </div>
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) onClose()
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              © 2026 Kas Dolan Bareng
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
