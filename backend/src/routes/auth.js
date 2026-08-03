import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'
import { sendVerificationEmail } from '../config/email.js'

const router = express.Router()

// Generate 6-digit code
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

// Register - sends verification code to email
router.post('/register', async (req, res) => {
  try {
    const { name, nickname, email, password } = req.body

    if (!name || !nickname || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' })
    }

    // Check if email already registered and verified
    const userExists = await pool.query('SELECT * FROM users WHERE email=$1', [email])

    if (userExists.rows.length > 0) {
      const existingUser = userExists.rows[0]
      // If registered but not verified, resend code
      if (!existingUser.is_verified) {
        const code = generateCode()
        const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        await pool.query(
          'UPDATE users SET verification_code=$1, verification_expires=$2 WHERE email=$3',
          [code, expires, email]
        )
        try {
          await sendVerificationEmail(email, existingUser.name, code)
        } catch (emailErr) {
          console.error('Email send error:', emailErr)
        }
        return res.status(200).json({
          message: 'Kode verifikasi baru telah dikirim ke email Anda',
          email,
          needVerification: true
        })
      }
      return res.status(400).json({ message: 'Email sudah terdaftar' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const code = generateCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create unverified user
    await pool.query(
      `INSERT INTO users (name, nickname, email, password, role, is_verified, verification_code, verification_expires, joined_at)
       VALUES ($1, $2, $3, $4, 'member', false, $5, $6, NOW())`,
      [name, nickname, email, hashedPassword, code, expires]
    )

    // Send verification email
    try {
      await sendVerificationEmail(email, name, code)
    } catch (emailErr) {
      console.error('Email send error:', emailErr.message)
      // Still proceed, user can request resend
    }

    res.status(201).json({
      message: 'Pendaftaran berhasil! Kode verifikasi telah dikirim ke email Anda.',
      email,
      needVerification: true
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Verify email code
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body

    if (!email || !code) {
      return res.status(400).json({ message: 'Email dan kode verifikasi wajib diisi' })
    }

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email tidak ditemukan' })
    }

    const user = result.rows[0]

    if (user.is_verified) {
      return res.status(400).json({ message: 'Email sudah terverifikasi' })
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ message: 'Kode verifikasi salah' })
    }

    if (new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ message: 'Kode verifikasi sudah kadaluarsa. Silakan daftar ulang.' })
    }

    // Mark as verified
    await pool.query(
      'UPDATE users SET is_verified=true, verification_code=NULL, verification_expires=NULL WHERE email=$1',
      [email]
    )

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.json({
      message: 'Email berhasil diverifikasi! Selamat datang di Kas Dolan Bareng.',
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        joinedAt: user.joined_at,
        totalContribution: user.total_contribution || 0
      },
      token
    })
  } catch (error) {
    console.error('Verify error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Resend verification code
router.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body
    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Email tidak ditemukan' })
    }

    const user = result.rows[0]
    if (user.is_verified) {
      return res.status(400).json({ message: 'Email sudah terverifikasi' })
    }

    const code = generateCode()
    const expires = new Date(Date.now() + 10 * 60 * 1000)

    await pool.query(
      'UPDATE users SET verification_code=$1, verification_expires=$2 WHERE email=$3',
      [code, expires, email]
    )

    await sendVerificationEmail(email, user.name, code)

    res.json({ message: 'Kode baru telah dikirim ke email Anda' })
  } catch (error) {
    console.error('Resend error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email])

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Email atau password salah' })
    }

    // Check if email is verified
    if (!user.is_verified) {
      // Resend verification code
      const code = generateCode()
      const expires = new Date(Date.now() + 10 * 60 * 1000)
      await pool.query(
        'UPDATE users SET verification_code=$1, verification_expires=$2 WHERE email=$3',
        [code, expires, email]
      )
      try {
        await sendVerificationEmail(email, user.name, code)
      } catch (emailErr) {
        console.error('Email error:', emailErr)
      }
      return res.status(403).json({
        message: 'Email belum diverifikasi. Kode baru telah dikirim ke email Anda.',
        email,
        needVerification: true
      })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        joinedAt: user.joined_at,
        totalContribution: user.total_contribution || 0
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
