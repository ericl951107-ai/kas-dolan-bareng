import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiMail, FiCalendar, FiDollarSign } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency, formatDateTime } from '../utils/formatters'
import toast from 'react-hot-toast'

export default function MemberDetail() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMemberData()
  }, [id])

  const loadMemberData = async () => {
    try {
      const [memberRes, transactionsRes] = await Promise.all([
        api.get(`/members/${id}`),
        api.get(`/transactions/member/${id}`),
      ])
      setMember(memberRes.data)
      setTransactions(transactionsRes.data)
    } catch (error) {
      toast.error('Gagal memuat data anggota')
    } finally {
      setLoading(false)
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
    <div className="space-y-6 max-w-4xl">
      <Link to="/members" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700">
        <FiArrowLeft />
        Kembali ke Daftar Anggota
      </Link>

      {/* Member Info */}
      <div className="card">
        <div className="flex items-start gap-6">
          {member?.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <FiUser className="w-12 h-12 text-primary-600 dark:text-primary-400" />
            </div>
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{member?.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">@{member?.nickname}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiMail className="w-5 h-5" />
                <span>{member?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiCalendar className="w-5 h-5" />
                <span>Bergabung {formatDateTime(member?.joinedAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                <FiDollarSign className="w-5 h-5" />
                <span>Total: {formatCurrency(member?.totalContribution || 0)}</span>
              </div>
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  member?.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {member?.paymentStatus === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4">Riwayat Pembayaran</h2>
        
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Belum ada riwayat pembayaran
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                </div>
                <p className="text-lg font-bold text-green-600">
                  +{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
