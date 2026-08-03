import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const router = express.Router()

// Get all targets (semua user bisa lihat)
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as created_by_name,
        COALESCE((
          SELECT SUM(tr.amount)
          FROM transactions tr
          WHERE tr.type = 'income' AND tr.status = 'completed'
        ), 0) as total_collected
      FROM targets t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create target (admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { title, description, target_amount, per_person_amount, deadline } = req.body

    if (!title || !target_amount) {
      return res.status(400).json({ message: 'Judul dan target jumlah wajib diisi' })
    }

    const result = await pool.query(`
      INSERT INTO targets (title, description, target_amount, per_person_amount, deadline, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, description, target_amount, per_person_amount || 0, deadline || null, req.user.id])

    res.status(201).json({ message: 'Target berhasil dibuat', target: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update target (admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, target_amount, per_person_amount, deadline, status } = req.body

    const result = await pool.query(`
      UPDATE targets
      SET title = $1, description = $2, target_amount = $3,
          per_person_amount = $4, deadline = $5, status = $6,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `, [title, description, target_amount, per_person_amount || 0, deadline || null, status || 'active', id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Target tidak ditemukan' })
    }

    res.json({ message: 'Target berhasil diperbarui', target: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete target (admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM targets WHERE id = $1 RETURNING id', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Target tidak ditemukan' })
    }

    res.json({ message: 'Target berhasil dihapus' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
