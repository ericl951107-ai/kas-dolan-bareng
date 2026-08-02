import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiMail, FiCalendar, FiDollarSign, FiSearch, FiAward } from 'react-icons/fi'
import api from '../utils/api'
import { formatCurrency } from '../utils/formatters'
import toast from 'react-hot-toast'

export default function Members() {
  const [members, setMembers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const response = await api.get('/members')
      console.log('Members data:', response.data)
      setMembers(response.data)
    } catch (error) {
      console.error('Load members error:', error)
      toast.error('Gagal memuat data anggota')
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = members.filter(member =>
    member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Tidak tersedia'
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Tidak tersedia'
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Tidak tersedia'
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Anggota
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Daftar semua anggota kas ({members.length} anggota)
        </p>
      </div>

      <div className="card">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari anggota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <div
            key={member.id}
            className="card hover:shadow-lg transition-shadow relative"
          >
            {index < 3 && (
              <div className="absolute top-4 right-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  index === 1 ? 'bg-gray-100 dark:bg-gray-700' :
                  'bg-orange-100 dark:bg-orange-900/30'
                }`}>
                  <FiAward className={`w-4 h-4 ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-600' :
                    'text-orange-600'
                  }`} />
                </div>
              </div>
            )}

            <div className="flex items-start gap-4">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <FiUser className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{member.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  @{member.nickname}
                </p>

                <div className="mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    member.payment_status === 'paid'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {member.payment_status === 'paid' ? 'Sudah Bayar' : 'Belum Bayar'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiMail className="w-4 h-4" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <FiCalendar className="w-4 h-4" />
                <span>Bergabung {formatDate(member.joined_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium">
                <FiDollarSign className="w-4 h-4" />
                <span>Total: {formatCurrency(parseFloat(member.total_contribution) || 0)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada anggota yang ditemukan
          </p>
        </div>
      )}
    </div>
  )
}
