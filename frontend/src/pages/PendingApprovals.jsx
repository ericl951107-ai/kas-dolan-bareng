import { useState, useEffect } from 'react'
import { FiCheck, FiX, FiImage, FiClock, FiDollarSign } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function PendingApprovals() {
  const { user } = useAuthStore()
  const [pendingPayments, setPendingPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    // Check if user is admin or bendahara
    if (user?.role !== 'admin' && user?.role !== 'bendahara') {
      window.location.href = '/'
      return
    }
    
    loadPendingPayments()
  }, [user])

  const loadPendingPayments = async () => {
    try {
      setLoading(true)
      const response = await api.get('/payments/pending')
      setPendingPayments(response.data)
    } catch (error) {
      toast.error('Gagal memuat data pembayaran pending')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (paymentId) => {
    if (!confirm('Apakah Anda yakin ingin menyetujui pembayaran ini?')) {
      return
    }

    setProcessing(true)
    try {
      await api.put(`/payments/approve/${paymentId}`)
      toast.success('Pembayaran berhasil disetujui')
      loadPendingPayments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal approve pembayaran')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectClick = (payment) => {
    setSelectedPayment(payment)
    setRejectionReason('')
    setShowRejectModal(true)
  }

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Masukkan alasan penolakan')
      return
    }

    setProcessing(true)
    try {
      await api.put(`/payments/reject/${selectedPayment.id}`, {
        reason: rejectionReason
      })
      toast.success('Pembayaran ditolak')
      setShowRejectModal(false)
      loadPendingPayments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal reject pembayaran')
    } finally {
      setProcessing(false)
    }
  }

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment)
    setShowReceiptModal(true)
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pembayaran Pending
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Verifikasi pembayaran dari anggota ({pendingPayments.length} pending)
        </p>
      </div>

      {pendingPayments.length === 0 ? (
        <div className="card text-center py-12">
          <FiCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Tidak Ada Pembayaran Pending</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Semua pembayaran sudah diverifikasi
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingPayments.map((payment) => (
            <div key={payment.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Payment Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{payment.user_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{payment.nickname}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(parseFloat(payment.amount))}
                      </p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                        <FiClock className="w-3 h-3 mr-1" />
                        Pending
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FiDollarSign className="w-4 h-4" />
                      <span>{payment.description || 'Iuran Kas'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <FiClock className="w-4 h-4" />
                      <span>{formatDateTime(payment.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Metode:</span>
                      <span>{payment.method === 'transfer' ? 'Transfer Bank' : payment.method}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt Preview */}
                {payment.receipt && (
                  <div className="w-full md:w-48">
                    <div 
                      className="relative h-32 md:h-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handleViewReceipt(payment)}
                    >
                      <img 
                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${payment.receipt}`}
                        alt="Bukti Transfer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <FiImage className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400">
                      Klik untuk memperbesar
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleApprove(payment.id)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiCheck className="w-4 h-4" />
                  Setujui
                </button>
                <button
                  onClick={() => handleRejectClick(payment)}
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiX className="w-4 h-4" />
                  Tolak
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">Tolak Pembayaran</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Pembayaran dari <strong>{selectedPayment?.user_name}</strong> sebesar{' '}
              <strong>{formatCurrency(parseFloat(selectedPayment?.amount || 0))}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Alasan Penolakan *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="input-field resize-none"
                rows="3"
                placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRejectSubmit}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {processing ? 'Memproses...' : 'Ya, Tolak'}
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowReceiptModal(false)}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Bukti Transfer</h3>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedPayment?.receipt}`}
                alt="Bukti Transfer"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
