import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get all members
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, nickname, email, avatar, role,
        total_contribution, payment_status, joined_at
      FROM users
      ORDER BY total_contribution DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get member by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, name, nickname, email, avatar, role,
        total_contribution, payment_status, joined_at
      FROM users
      WHERE id = $1
    `, [req.params.id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Anggota tidak ditemukan' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
