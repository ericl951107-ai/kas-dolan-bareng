import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'
import uploadConfig from '../config/upload.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Get user profile (own)
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
      FROM users WHERE id = $1
    `, [req.user.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update own profile (name, nickname)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, nickname } = req.body
    const result = await pool.query(`
      UPDATE users SET name=$1, nickname=$2, updated_at=NOW()
      WHERE id=$3
      RETURNING id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
    `, [name, nickname, req.user.id])
    res.json({ message: 'Profil berhasil diperbarui', user: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Upload avatar (all users)
router.post('/avatar', auth, uploadConfig.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File avatar tidak ditemukan' })
    }

    // Delete old avatar if exists
    const oldUser = await pool.query('SELECT avatar FROM users WHERE id=$1', [req.user.id])
    if (oldUser.rows[0]?.avatar) {
      const oldPath = path.join(__dirname, '../../', oldUser.rows[0].avatar)
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath)
      }
    }

    const avatarPath = `/uploads/receipts/${req.file.filename}`
    const result = await pool.query(`
      UPDATE users SET avatar=$1, updated_at=NOW()
      WHERE id=$2
      RETURNING id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
    `, [avatarPath, req.user.id])

    res.json({ message: 'Foto profil berhasil diperbarui', user: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, nickname, email, role, avatar, total_contribution, payment_status, joined_at
      FROM users ORDER BY joined_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update any user (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { name, nickname, email, role } = req.body

    const checkUser = await pool.query('SELECT id FROM users WHERE id=$1', [id])
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    const result = await pool.query(`
      UPDATE users SET name=$1, nickname=$2, email=$3, role=$4, updated_at=NOW()
      WHERE id=$5
      RETURNING id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
    `, [name, nickname, email, role, id])

    res.json({ message: 'User berhasil diperbarui', user: result.rows[0] })
  } catch (error) {
    console.error(error)
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Email sudah digunakan' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' })
    }

    const checkUser = await pool.query('SELECT id, name, email FROM users WHERE id=$1', [id])
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    await pool.query('DELETE FROM users WHERE id=$1', [id])
    res.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
