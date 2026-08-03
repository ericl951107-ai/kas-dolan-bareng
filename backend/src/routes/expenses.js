import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'
import { adminOrBendaharaAuth } from '../middleware/adminAuth.js'
import uploadConfig from '../config/upload.js'

const router = express.Router()

// Get all expenses - all authenticated users can view
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as created_by_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC
    `)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create expense - admin OR bendahara
router.post('/', auth, adminOrBendaharaAuth, uploadConfig.single('receipt'), async (req, res) => {
  try {
    const { title, amount, category, description } = req.body
    const receiptPath = req.file ? `/uploads/receipts/${req.file.filename}` : null

    const expenseResult = await pool.query(`
      INSERT INTO expenses (title, amount, category, description, receipt, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, amount, category, description, receiptPath, req.user.id])

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, category, status)
      VALUES ($1, 'expense', $2, $3, $4, 'completed')
    `, [req.user.id, amount, title, category])

    res.status(201).json({ message: 'Pengeluaran berhasil ditambahkan', expense: expenseResult.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Update expense - admin OR bendahara
router.put('/:id', auth, adminOrBendaharaAuth, async (req, res) => {
  try {
    const { title, amount, category, description } = req.body
    const result = await pool.query(`
      UPDATE expenses SET title=$1, amount=$2, category=$3, description=$4, updated_at=NOW()
      WHERE id=$5 RETURNING *
    `, [title, amount, category, description, req.params.id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pengeluaran tidak ditemukan' })
    }
    res.json({ message: 'Pengeluaran berhasil diperbarui', expense: result.rows[0] })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete expense - admin only
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }
    await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id])
    res.json({ message: 'Pengeluaran berhasil dihapus' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
