import { useState, useRef, useEffect } from 'react'
import { FiDollarSign, FiCreditCard, FiDownload, FiCheck } from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import api from '../utils/api'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function Payment() {
  const { user } = useAuthStore()
  const qrRef = useRef(null)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('qris')
  const [qrData, setQrData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bankSettings, setBankSettings] = useState({
    bank_name: 'BCA',
    bank_account_number: '1234567890',
    account_holder_name: 'Bendahara Kas'
  })

  useEffect(() => {
    fetchBankSettings()
  }, [])

  const fetchBankSettings = async () => {
    try {
      const response = await api.get('/settings')
      setBankSettings({
        bank_name: response.data.bank_name || 'BCA',
        bank_account_number: response.data.bank_account_number || '1234567890',
        account_holder_name: response.data.account_holder_name || 'Bendahara Kas'
      })
    } catch (error) {
      console.error('Failed to fetch bank settings:', error)
      // Use default values if fetch fails
    }
  }

  const handleGenerateQR = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/payments/generate-qr', {
        amount: parseFloat(amount),
        description: description || 'Iuran Kas',
      })
      
      setQrData(response.data)
      toast.success('QR Code berhasil dibuat')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = async () => {
    if (!qrRef.current) return

    try {
      const canvas = await html2canvas(qrRef.current)
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `qr-payment-${Date.now()}.png`
      link.href = url
      link.click()
      toast.success('QR Code berhasil diunduh')
    } catch (error) {
      toast.error('Gagal mengunduh QR Code')
    }
  }

  const handleDirectPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }

    setLoading(true)
    try {
      await api.post('/payments/direct', {
        amount: parseFloat(amount),
        description: description || 'Iuran Kas',
        method: paymentMethod,
      })
      
      toast.success('Pembayaran berhasil! Menunggu verifikasi.')
      setAmount('')
      setDescription('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Pembayaran gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bayar Kas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Tentukan nominal dan pilih metode pembayaran
        </p>
      </div>

      {/* Payment Form */}
      <div className="card">
        <div className="space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nominal Iuran (Bebas)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-12 text-lg"
                placeholder="0"
                min="0"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Setiap anggota bebas menentukan nominal iuran
            </p>
          </div>

          {/* Quick Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nominal Cepat
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[10000, 20000, 50000, 100000, 200000, 500000].map((value) => (
                <button
                  key={value}
                  onClick={() => setAmount(value.toString())}
                  className="btn-secondary text-sm"
                >
                  {formatCurrency(value)}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Keterangan (Opsional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows="3"
              placeholder="Catatan untuk pembayaran ini..."
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('qris')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'qris'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                      <FiCreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">QRIS</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Scan & bayar
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'qris' && (
                    <FiCheck className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </button>

              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  paymentMethod === 'transfer'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <FiDollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Transfer Bank</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Transfer manual
                      </p>
                    </div>
                  </div>
                  {paymentMethod === 'transfer' && (
                    <FiCheck className="w-5 h-5 text-primary-600" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {paymentMethod === 'qris' ? (
              <button
                onClick={handleGenerateQR}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Memproses...' : 'Buat QR Code'}
              </button>
            ) : (
              <button
                onClick={handleDirectPayment}
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Memproses...' : 'Lanjutkan Pembayaran'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* QR Code Display */}
      {qrData && (
        <div className="card text-center animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">QR Code Pembayaran</h3>
          
          <div ref={qrRef} className="inline-block p-6 bg-white rounded-lg">
            <QRCodeSVG
              value={qrData.qrString}
              size={256}
              level="H"
              includeMargin={true}
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                {user?.name}
              </p>
              <p className="text-lg font-bold text-primary-600 mt-1">
                {formatCurrency(parseFloat(amount))}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ID: {qrData.transactionId}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadQR}
            className="btn-secondary mt-4 inline-flex items-center gap-2"
          >
            <FiDownload />
            Unduh QR Code
          </button>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Scan QR code dengan aplikasi pembayaran digital Anda (GoPay, OVO, Dana, dll)
            </p>
          </div>
        </div>
      )}

      {/* Transfer Info */}
      {paymentMethod === 'transfer' && !loading && (
        <div className="card animate-slide-up">
          <h3 className="text-lg font-semibold mb-4">Informasi Transfer</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Bank</p>
              <p className="font-semibold text-lg">{bankSettings.bank_name}</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Nomor Rekening</p>
              <p className="font-semibold text-lg">{bankSettings.bank_account_number}</p>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Atas Nama</p>
              <p className="font-semibold text-lg">{bankSettings.account_holder_name}</p>
            </div>

            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-primary-700 dark:text-primary-300 mb-1">
                Total Transfer
              </p>
              <p className="font-bold text-2xl text-primary-600 dark:text-primary-400">
                {formatCurrency(parseFloat(amount) || 0)}
              </p>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                Setelah transfer, silakan upload bukti pembayaran di halaman riwayat atau hubungi bendahara.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
