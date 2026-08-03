import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

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

// Get all users (admin only)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, nickname, email, role, avatar, total_contribution, payment_status, joined_at
      FROM users
      ORDER BY joined_at DESC
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
    
    // Check if user exists
    const checkUser = await pool.query('SELECT id FROM users WHERE id = $1', [id])
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }
    
    // Update user
    const result = await pool.query(`
      UPDATE users 
      SET name = $1, nickname = $2, email = $3, role = $4
      WHERE id = $5
      RETURNING id, name, nickname, email, avatar, role, total_contribution, payment_status, joined_at
    `, [name, nickname, email, role, id])
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'update_user', 'user', id, JSON.stringify({ name, nickname, email, role })]
    )

    res.json({ message: 'User berhasil diperbarui', user: result.rows[0] })
  } catch (error) {
    console.error(error)
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Email sudah digunakan' })
    }
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete user (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    
    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' })
    }
    
    // Check if user exists
    const checkUser = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id])
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }
    
    const deletedUser = checkUser.rows[0]
    
    // Delete user (CASCADE will delete related records)
    await pool.query('DELETE FROM users WHERE id = $1', [id])
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'delete_user', 'user', id, JSON.stringify(deletedUser)]
    )

    res.json({ message: 'User berhasil dihapus' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
