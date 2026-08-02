import { useState, useEffect } from 'react'
import { FiTrendingUp, FiTrendingDown, FiFilter, FiDownload, FiCalendar } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'

export default function History() {
  const [transactions, setTransactions] = useState([])
  const [filter, setFilter] = useState('all') // all, income, expense
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTransactions()
  }, [filter, dateRange])

  const loadTransactions = async () => {
    try {
      const params = {
        type: filter !== 'all' ? filter : undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      }
      const response = await api.get('/transactions', { params })
      setTransactions(response.data)
    } catch (error) {
      toast.error('Gagal memuat riwayat transaksi')
    } finally {
      setLoading(false)
    }
  }

  const exportToExcel = () => {
    const data = transactions.map(t => ({
      Tanggal: formatDateTime(t.createdAt),
      Jenis: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Nama: t.userName,
      Deskripsi: t.description,
      Nominal: t.amount,
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Riwayat')
    XLSX.writeFile(wb, `riwayat-kas-${Date.now()}.xlsx`)
    toast.success('File Excel berhasil diunduh')
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text('Riwayat Transaksi Kas', 14, 22)
    
    doc.setFontSize(11)
    let y = 35
    
    transactions.forEach((t, i) => {
      if (y > 270) {
        doc.addPage()
        y = 20
      }
      
      doc.text(`${formatDateTime(t.createdAt)}`, 14, y)
      doc.text(`${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}`, 60, y)
      doc.text(`${t.userName}`, 110, y)
      doc.text(`${formatCurrency(t.amount)}`, 160, y)
      y += 10
    })
    
    doc.save(`riwayat-kas-${Date.now()}.pdf`)
    toast.success('File PDF berhasil diunduh')
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
            Riwayat Transaksi
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Semua transaksi pemasukan dan pengeluaran
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="btn-secondary flex items-center gap-2"
          >
            <FiDownload />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="btn-secondary flex items-center gap-2"
          >
            <FiDownload />
            PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiFilter className="inline mr-1" />
              Jenis
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FiCalendar className="inline mr-1" />
              Dari Tanggal
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FiCalendar className="inline mr-1" />
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="card">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Tidak ada transaksi yang ditemukan
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {transaction.type === 'income' ? (
                      <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiTrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.userName} • {formatDateTime(transaction.createdAt)}
                    </p>
                    {transaction.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                        {transaction.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  {transaction.method && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      via {transaction.method}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
