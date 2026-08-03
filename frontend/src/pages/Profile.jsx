import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FiUser, FiLogOut, FiEdit2, FiCamera, FiSave, 
  FiX, FiMail, FiShield, FiCalendar, FiDollarSign 
} from 'react-icons/fi'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { formatDate, formatCurrency } from '../utils/formatters'

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

const ROLE_LABELS = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  bendahara: { label: 'Bendahara', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  member: { label: 'Anggota', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const fileInputRef = useRef(null)

  const [editing, setEditing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(null)

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

  const handleEditToggle = () => {
    if (!editing) {
      setFormData({ name: user?.name || '', nickname: user?.nickname || '' })
    }
    setEditing(!editing)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.nickname.trim()) {
      toast.error('Nama dan nickname tidak boleh kosong')
      return
    }

    setSavingProfile(true)
    try {
      const response = await api.put('/users/profile', formData)
      updateUser(response.data.user)
      toast.success('Profil berhasil diperbarui')
      setEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran foto maksimal 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan')
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)

    // Upload to server
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      updateUser(response.data.user)
      toast.success('Foto profil berhasil diperbarui')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal upload foto')
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const getAvatarSrc = () => {
    if (avatarPreview) return avatarPreview
    if (user?.avatar) {
      // If already a full URL
      if (user.avatar.startsWith('http')) return user.avatar
      // Relative path from backend
      return `${API_BASE}${user.avatar}`
    }
    return null
  }

  const roleInfo = ROLE_LABELS[user?.role] || ROLE_LABELS.member

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola informasi profil Anda</p>
      </div>

      {/* Avatar & Name Card */}
      <div className="card">
        <div className="flex flex-col items-center text-center mb-6">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 border-4 border-white dark:border-gray-700 shadow-lg">
              {getAvatarSrc() ? (
                <img
                  src={getAvatarSrc()}
                  alt={user?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FiUser className="w-14 h-14 text-primary-600 dark:text-primary-400" />
                </div>
              )}
            </div>

            {/* Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-9 h-9 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
            >
              {uploadingAvatar
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <FiCamera className="w-4 h-4" />
              }
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />
          </div>

          <h2 className="text-2xl font-bold">{user?.name}</h2>
          <p className="text-gray-500 dark:text-gray-400">@{user?.nickname}</p>
          <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${roleInfo.color}`}>
            {roleInfo.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Kontribusi</p>
            <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(parseFloat(user?.totalContribution) || 0)}
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Bergabung</p>
            <p className="text-sm font-semibold">{formatDate(user?.joinedAt)}</p>
          </div>
        </div>

        {/* Edit profile form */}
        {editing ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Nama lengkap Anda"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nama Panggilan</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="input-field"
                placeholder="Nama panggilan Anda"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={handleEditToggle}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Batal
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={handleEditToggle}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors font-medium"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Nama & Panggilan
          </button>
        )}
      </div>

      {/* Account Info Card */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Informasi Akun</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FiMail className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FiShield className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="font-medium capitalize">{roleInfo.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FiCalendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tanggal Bergabung</p>
              <p className="font-medium">{formatDate(user?.joinedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <FiDollarSign className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Kontribusi</p>
              <p className="font-medium text-primary-600 dark:text-primary-400">
                {formatCurrency(parseFloat(user?.totalContribution) || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Avatar Hint */}
      <div className="card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <FiCamera className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-300">Ganti Foto Profil</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Klik tombol kamera di foto profil untuk menggantinya. Format JPG/PNG, maksimal 5MB.
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="card">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 text-red-600 hover:text-red-700 dark:hover:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <FiLogOut className="w-5 h-5" />
          Keluar dari Akun
        </button>
      </div>
    </div>
  )
}
