import { useState, useEffect } from 'react'
import { FiDollarSign, FiUpload, FiX, FiImage } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

export default function Payment() {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
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
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Hanya file gambar yang diperbolehkan')
        return
      }

      setReceiptFile(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setReceiptPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveFile = () => {
    setReceiptFile(null)
    setReceiptPreview(null)
  }

  const handleDirectPayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Masukkan nominal yang valid')
      return
    }

    if (!receiptFile) {
      toast.error('Upload bukti transfer terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('amount', parseFloat(amount))
      formData.append('description', description || 'Iuran Kas')
      formData.append('method', 'transfer')
      formData.append('receipt', receiptFile)

      const response = await api.post('/payments/direct', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success(response.data.message)
      
      setAmount('')
      setDescription('')
      setReceiptFile(null)
      setReceiptPreview(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Bayar Kas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Transfer ke rekening bendahara dan upload bukti pembayaran
        </p>
      </div>

      {/* Bank Info */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">📋 Informasi Rekening</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Bank</span>
            <span className="font-semibold">{bankSettings.bank_name}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Nomor Rekening</span>
            <span className="font-semibold">{bankSettings.bank_account_number}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <span className="text-sm text-gray-600 dark:text-gray-400">Atas Nama</span>
            <span className="font-semibold">{bankSettings.account_holder_name}</span>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">💰 Form Pembayaran</h3>
        
        <div className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nominal Transfer
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-field pl-12 text-lg"
                placeholder="0"
                min="0"
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[50000, 100000, 200000, 500000, 1000000, 2000000].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value.toString())}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                {formatCurrency(value)}
              </button>
            ))}
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
              rows="2"
              placeholder="Contoh: Iuran bulan Januari"
            />
          </div>

          {/* Upload Receipt */}
          <div>
            <label className="block text-sm font-medium mb-2">
              📸 Upload Bukti Transfer *
            </label>
            
            {!receiptPreview ? (
              <div 
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('receipt-upload').click()}
              >
                <FiUpload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Klik untuk upload bukti transfer
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF (Max 5MB)
                </p>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={receiptPreview} 
                  alt="Preview" 
                  className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
                  <FiImage className="w-3 h-3" />
                  {receiptFile?.name}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleDirectPayment}
            disabled={loading || !amount || !receiptFile}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Kirim Pembayaran'}
          </button>

          {/* Info */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              ℹ️ Pembayaran Anda akan diverifikasi oleh admin/bendahara dalam 1x24 jam. 
              Anda akan menerima notifikasi setelah pembayaran disetujui.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
