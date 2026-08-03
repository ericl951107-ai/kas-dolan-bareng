import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiRefreshCw } from 'react-icons/fi'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuthStore()
  const email = location.state?.email || ''
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/register')
      return
    }
    // Start countdown for resend
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [email, navigate])

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all filled
    if (value && index === 5) {
      const fullCode = [...newCode].join('')
      if (fullCode.length === 6) {
        handleVerify(fullCode)
      }
    }
  }

  const handleKeyDown = (index, e) => {
    // On backspace, clear current and focus prev
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      const newCode = pasted.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
      handleVerify(pasted)
    }
  }

  const handleVerify = async (codeStr) => {
    const fullCode = codeStr || code.join('')
    if (fullCode.length !== 6) {
      toast.error('Masukkan 6 digit kode verifikasi')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/auth/verify-email', {
        email,
        code: fullCode
      })

      // Auto login after verification
      login(response.data.user, response.data.token)
      toast.success(response.data.message)
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Kode verifikasi salah')
      // Clear code on error
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await api.post('/auth/resend-code', { email })
      toast.success('Kode baru telah dikirim ke email Anda')
      setCountdown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0 }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal kirim ulang kode')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verifikasi Email</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Kami telah mengirim kode 6 digit ke
            </p>
            <p className="font-semibold text-primary-600 dark:text-primary-400">{email}</p>
          </div>

          {/* Code Input */}
          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all
                  focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white
                  ${digit ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-300 dark:border-gray-600'}
                  ${loading ? 'opacity-50' : ''}
                `}
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || code.join('').length !== 6}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>

          {/* Resend */}
          <div className="text-center mt-4">
            {countdown > 0 ? (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kirim ulang kode dalam <span className="font-bold text-primary-600">{countdown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 mx-auto"
              >
                <FiRefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Mengirim...' : 'Kirim Ulang Kode'}
              </button>
            )}
          </div>

          {/* Back */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/register')}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ← Kembali ke Registrasi
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
