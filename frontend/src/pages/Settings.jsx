import { useState } from 'react'
import { FiShare2, FiCopy, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Settings() {
  const [copied, setCopied] = useState(false)
  const groupLink = `${window.location.origin}/join/ABC123`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupLink)
    setCopied(true)
    toast.success('Link berhasil disalin')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Kas Dolan Bareng',
          text: 'Bergabung dengan grup kas kami!',
          url: groupLink,
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Pengaturan
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Kelola pengaturan grup kas
        </p>
      </div>

      {/* Share Group Link */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Undang Anggota Baru</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Bagikan link ini untuk mengundang anggota baru ke grup kas
        </p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={groupLink}
            readOnly
            className="input-field flex-1"
          />
          <button
            onClick={handleCopyLink}
            className="btn-secondary flex items-center gap-2"
          >
            {copied ? <FiCheck /> : <FiCopy />}
            {copied ? 'Tersalin' : 'Salin'}
          </button>
          <button
            onClick={handleShareLink}
            className="btn-primary flex items-center gap-2"
          >
            <FiShare2 />
            Bagikan
          </button>
        </div>
      </div>

      {/* Group Info */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Informasi Grup</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Grup</label>
            <input
              type="text"
              defaultValue="Kas Dolan Bareng"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              defaultValue="Grup kas untuk kegiatan bersama"
              className="input-field resize-none"
              rows="3"
            />
          </div>
          <button className="btn-primary">Simpan Perubahan</button>
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Notifikasi</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span>Pembayaran Baru</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>Pengeluaran Baru</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
          <label className="flex items-center justify-between">
            <span>Anggota Baru</span>
            <input type="checkbox" defaultChecked className="w-5 h-5" />
          </label>
        </div>
      </div>
    </div>
  )
}
