import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLogOut, FiEdit2 } from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency } from '../utils/formatters'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nickname: user?.nickname || '',
  })

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar?')) {
      logout()
      navigate('/login')
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await api.put('/users/profile', formData)
      toast.success('Profil berhasil diperbarui')
      setEditing(false)
    } catch (error) {
      toast.error('Gagal memperbarui profil')
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profil Saya
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola informasi profil Anda
        </p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start gap-6">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiUser className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
          )}

          <div className="flex-1">
            {editing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nama Panggilan</label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">
                    Simpan
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditing(false)}
                    className="btn-secondary"
                  >
                    Batal
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <FiEdit2 />
                  </button>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  @{user?.nickname}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Peran:</span>{' '}
                    <span className="font-medium capitalize">{user?.role || 'Anggota'}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Bergabung:</span>{' '}
                    <span className="font-medium">{formatDate(user?.joinedAt)}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Kontribusi:</span>{' '}
                    <span className="font-medium text-primary-600">
                      {formatCurrency(user?.totalContribution || 0)}
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="card">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:text-red-700 font-medium"
        >
          <FiLogOut />
          Keluar
        </button>
      </div>
    </div>
  )
}
