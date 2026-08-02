import express from 'express'
import pool from '../config/database.js'
import { auth, adminOnly } from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import cloudinary from '../config/cloudinary.js'

const router = express.Router()

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, u.name as created_by_name
      FROM expenses e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.created_at DESC
    `)
    
    res.json(result.rows.map(row => ({
      ...row,
      createdBy: row.created_by_name
    })))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Create expense
router.post('/', auth, adminOnly, upload.single('receipt'), async (req, res) => {
  try {
    const { title, amount, category, description } = req.body
    let receiptUrl = null

    // Upload receipt to Cloudinary if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ folder: 'kas-receipts' }, (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }).end(req.file.buffer)
      })
      receiptUrl = result.secure_url
    }

    // Insert expense
    const expenseResult = await pool.query(`
      INSERT INTO expenses (title, amount, category, description, receipt, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [title, amount, category, description, receiptUrl, req.user.id])

    // Create transaction record
    await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, category, status)
      VALUES ($1, 'expense', $2, $3, $4, 'completed')
    `, [req.user.id, amount, title, category])

    res.status(201).json(expenseResult.rows[0])
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Delete expense
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await pool.query('DELETE FROM expenses WHERE id = $1', [req.params.id])
    res.json({ message: 'Pengeluaran berhasil dihapus' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
