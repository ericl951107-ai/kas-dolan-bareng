import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
      FROM users
      WHERE id = $1
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

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, nickname } = req.body
    
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, nickname = $2
      WHERE id = $3
      RETURNING id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
    `, [name, nickname, req.user.id])

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
