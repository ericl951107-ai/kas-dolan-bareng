import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FiDollarSign, FiUsers, FiTrendingUp, FiTrendingDown,
  FiArrowRight, FiClock
} from 'react-icons/fi'
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'
import api from '../utils/api'
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/formatters'
import toast from 'react-hot-toast'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBalance: 0,
    totalMembers: 0,
    totalIncome: 0,
    totalExpenses: 0,
  })
  const [targetAmount, setTargetAmount] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState([])
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsRes, transactionsRes, chartRes, settingsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/transactions/recent?limit=5'),
        api.get('/dashboard/chart-data'),
        api.get('/settings'),
      ])

      setStats(statsRes.data)
      setRecentTransactions(transactionsRes.data)
      setChartData(chartRes.data)
      setTargetAmount(parseFloat(settingsRes.data.target_amount) || 0)
    } catch (error) {
      toast.error('Gagal memuat data dashboard')
    } finally {
      setLoading(false)
    }
  }

  const progressPercentage = targetAmount > 0 
    ? Math.min((stats.totalBalance / targetAmount) * 100, 100)
    : 0

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Ringkasan kas dan aktivitas terbaru
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Total Saldo</p>
              <h3 className="text-2xl font-bold mt-1">
                {formatCurrency(stats.totalBalance)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Anggota</p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalMembers}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>

      {/* Target Progress Bar */}
      {targetAmount > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Progress Target Kas</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Target: {formatCurrency(targetAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {progressPercentage.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(stats.totalBalance)} / {formatCurrency(targetAmount)}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative w-full h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                progressPercentage >= 100 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : progressPercentage >= 75
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                  : progressPercentage >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${progressPercentage}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          {/* Status Message */}
          <p className="text-sm text-center mt-3 text-gray-600 dark:text-gray-400">
            {progressPercentage >= 100 
              ? '🎉 Target sudah tercapai!' 
              : progressPercentage >= 75
              ? '💪 Hampir mencapai target!'
              : progressPercentage >= 50
              ? '📈 Setengah jalan menuju target'
              : progressPercentage >= 25
              ? '🚀 Terus semangat mengumpulkan!'
              : '💵 Ayo mulai mengumpulkan kas!'}
          </p>
        </div>
      )}
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pemasukan</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(stats.totalIncome)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pengeluaran</p>
              <h3 className="text-2xl font-bold mt-1 text-red-600">
                {formatCurrency(stats.totalExpenses)}
              </h3>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <FiTrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Tren Kas (7 Hari Terakhir)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#22c55e" 
                name="Pemasukan"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                name="Pengeluaran"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Perbandingan Kas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pemasukan', value: stats.totalIncome },
                  { name: 'Pengeluaran', value: stats.totalExpenses },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Transaksi Terbaru</h3>
          <Link 
            to="/history" 
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
          >
            Lihat Semua
            <FiArrowRight />
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Belum ada transaksi
          </div>
        ) : (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30'
                  }`}>
                    {transaction.type === 'income' ? (
                      <FiTrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiTrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      {formatRelativeTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {transaction.userName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
