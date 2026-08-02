import { useState, useEffect } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Expenses() {
  const { user } = useAuthStore()
  const [expenses, setExpenses] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    description: '',
    receipt: null,
  })
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.role === 'admin' || user?.role === 'bendahara'

  useEffect(() => {
    loadExpenses()
  }, [])

  const loadExpenses = async () => {
    try {
      const response = await api.get('/expenses')
      setExpenses(response.data)
    } catch (error) {
      toast.error('Gagal memuat data pengeluaran')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      data.append('title', formData.title)
      data.append('amount', formData.amount)
      data.append('category', formData.category)
      data.append('description', formData.description)
      if (formData.receipt) {
        data.append('receipt', formData.receipt)
      }

      await api.post('/expenses', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Pengeluaran berhasil ditambahkan')
      setShowModal(false)
      setFormData({ title: '', amount: '', category: '', description: '', receipt: null })
      loadExpenses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menambahkan pengeluaran')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pengeluaran ini?')) return

    try {
      await api.delete(`/expenses/${id}`)
      toast.success('Pengeluaran berhasil dihapus')
      loadExpenses()
    } catch (error) {
      toast.error('Gagal menghapus pengeluaran')
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pengeluaran
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola semua pengeluaran kas
          </p>
        </div>
        
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FiPlus />
            Tambah Pengeluaran
          </button>
        )}
      </div>

      {/* Expenses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.map((expense) => (
          <div key={expense.id} className="card">
            {expense.receipt && (
              <img
                src={expense.receipt}
                alt={expense.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{expense.title}</h3>
              {isAdmin && (
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FiTrash2 />
                </button>
              )}
            </div>

            <p className="text-2xl font-bold text-red-600 mb-2">
              {formatCurrency(expense.amount)}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                  {expense.category}
                </span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
                {expense.description}
              </p>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDateTime(expense.createdAt)} • {expense.createdBy}
              </p>
            </div>
          </div>
        ))}
      </div>

      {expenses.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Belum ada pengeluaran
          </p>
        </div>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Tambah Pengeluaran</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Judul</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Beli peralatan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nominal</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kategori</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input-field"
                >
                  <option value="">Pilih kategori</option>
                  <option value="Konsumsi">Konsumsi</option>
                  <option value="Transport">Transport</option>
                  <option value="Peralatan">Peralatan</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Keterangan</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows="3"
                  placeholder="Detail pengeluaran..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FiImage className="inline mr-1" />
                  Bukti Pembayaran
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, receipt: e.target.files[0] })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
