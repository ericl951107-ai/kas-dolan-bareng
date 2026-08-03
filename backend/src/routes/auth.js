import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/database.js'

const router = express.Router()

// Register - langsung aktif tanpa verifikasi
router.post('/register', async (req, res) => {
  try {
    const { name, nickname, email, password } = req.body

    if (!name || !nickname || !email || !password) {
      return res.status(400).json({ message: 'Semua field wajib diisi' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter' })
    }

    const userExists = await pool.query('SELECT id FROM users WHERE email=$1', [email])
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Email sudah terdaftar' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(`
      INSERT INTO users (name, nickname, email, password, role, is_verified, joined_at)
      VALUES ($1, $2, $3, $4, 'member', true, NOW())
      RETURNING id, name, nickname, email, role, joined_at
    `, [name, nickname, email, hashedPassword])

    const user = result.rows[0]

    // Auto login setelah register
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    )

    res.status(201).json({
      message: 'Pendaftaran berhasil! Selamat datang.',
      user: {
        id: user.id,
        name: user.name,
        nickname: user.nickname,
        email: user.email,
        role: user.role,
        avatar: null,
        joinedAt: user.joined_at,
        totalContribution: 0
      },
      token
    })
  } catch (error) {
    console.error('Register error:', error)
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
