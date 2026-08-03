import { useState, useEffect } from 'react'
import { FiTarget, FiPlus, FiEdit, FiTrash2, FiX, FiCalendar, FiUsers } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency, formatDate } from '../utils/formatters'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Targets() {
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTarget, setEditingTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    per_person_amount: '',
    deadline: '',
    status: 'active'
  })

  useEffect(() => {
    loadTargets()
  }, [])

  const loadTargets = async () => {
    try {
      const response = await api.get('/targets')
      setTargets(response.data)
    } catch (error) {
      toast.error('Gagal memuat target')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingTarget(null)
    setForm({ title: '', description: '', target_amount: '', per_person_amount: '', deadline: '', status: 'active' })
    setShowModal(true)
  }

  const openEditModal = (target) => {
    setEditingTarget(target)
    setForm({
      title: target.title,
      description: target.description || '',
      target_amount: target.target_amount,
      per_person_amount: target.per_person_amount || '',
      deadline: target.deadline ? target.deadline.substring(0, 10) : '',
      status: target.status
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingTarget) {
        await api.put(`/targets/${editingTarget.id}`, form)
        toast.success('Target berhasil diperbarui')
      } else {
        await api.post('/targets', form)
        toast.success('Target berhasil dibuat')
      }
      setShowModal(false)
      loadTargets()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan target')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus target ini?')) return
    try {
      await api.delete(`/targets/${id}`)
      toast.success('Target dihapus')
      loadTargets()
    } catch (error) {
      toast.error('Gagal menghapus target')
    }
  }

  const getProgress = (target) => {
    const collected = parseFloat(target.total_collected || 0)
    const total = parseFloat(target.target_amount)
    return total > 0 ? Math.min((collected / total) * 100, 100) : 0
  }

  const getProgressColor = (pct) => {
    if (pct >= 100) return 'bg-green-500'
    if (pct >= 75) return 'bg-blue-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Target Kas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola target pengumpulan kas</p>
        </div>
        {isAdmin && (
          <button onClick={openCreateModal} className="btn-primary flex items-center gap-2">
            <FiPlus className="w-4 h-4" />
            Tambah Target
          </button>
        )}
      </div>

      {targets.length === 0 ? (
        <div className="card text-center py-12">
          <FiTarget className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Belum Ada Target</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isAdmin ? 'Buat target kas pertama Anda' : 'Admin belum membuat target'}
          </p>
          {isAdmin && (
            <button onClick={openCreateModal} className="btn-primary">
              Buat Target Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {targets.map((target) => {
            const pct = getProgress(target)
            const collected = parseFloat(target.total_collected || 0)
            return (
              <div key={target.id} className="card hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{target.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        target.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : target.status === 'completed'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {target.status === 'active' ? 'Aktif' : target.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                      </span>
                    </div>
                    {target.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{target.description}</p>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => openEditModal(target)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(target.id)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-bold">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getProgressColor(pct)}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs mt-1 text-gray-500 dark:text-gray-400">
                    <span>{formatCurrency(collected)} terkumpul</span>
                    <span>Target: {formatCurrency(parseFloat(target.target_amount))}</span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-2 text-sm">
                  {parseFloat(target.per_person_amount) > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FiUsers className="w-4 h-4" />
                      <span>Per orang: <strong>{formatCurrency(parseFloat(target.per_person_amount))}</strong></span>
                    </div>
                  )}
                  {target.deadline && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FiCalendar className="w-4 h-4" />
                      <span>Deadline: <strong>{formatDate(target.deadline)}</strong></span>
                    </div>
                  )}
                </div>

                {/* Status message */}
                <p className="text-xs text-center mt-3 text-gray-500 dark:text-gray-400">
                  {pct >= 100 ? '🎉 Target tercapai!' :
                   pct >= 75 ? '💪 Hampir sampai!' :
                   pct >= 50 ? '📈 Setengah jalan!' :
                   '🚀 Ayo semangat!'}
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingTarget ? 'Edit Target' : 'Tambah Target Baru'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Judul Target *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-field"
                  placeholder="Contoh: Dolan ke Gunung Kidul"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field resize-none"
                  rows="2"
                  placeholder="Ceritakan sedikit tentang target ini..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Total Target Dana *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                    className="input-field pl-10"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Iuran Per Orang (Opsional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={form.per_person_amount}
                    onChange={(e) => setForm({ ...form, per_person_amount: e.target.value })}
                    className="input-field pl-10"
                    placeholder="Contoh: 200000"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Contoh: Dolan Gunung Kidul per orang Rp 200.000</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deadline (Opsional)</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="input-field"
                />
              </div>

              {editingTarget && (
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="active">Aktif</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 btn-primary">
                  {saving ? 'Menyimpan...' : editingTarget ? 'Simpan Perubahan' : 'Buat Target'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
