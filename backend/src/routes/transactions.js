import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get all transactions
router.get('/', auth, async (req, res) => {
  try {
    const { type, startDate, endDate, userId } = req.query
    let query = `
      SELECT t.*, u.name as user_name, u.nickname
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'completed'
    `
    const params = []
    
    if (userId) {
      params.push(userId)
      query += ` AND t.user_id = $${params.length}`
    }
    
    if (type && type !== 'all') {
      params.push(type)
      query += ` AND t.type = $${params.length}`
    }
    
    if (startDate) {
      params.push(startDate)
      query += ` AND t.created_at >= $${params.length}`
    }
    
    if (endDate) {
      params.push(endDate)
      query += ` AND t.created_at <= $${params.length}`
    }
    
    query += ' ORDER BY t.created_at DESC'
    
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get recent transactions
router.get('/recent', auth, async (req, res) => {
  try {
    const limit = req.query.limit || 10
    const result = await pool.query(`
      SELECT t.*, u.name as user_name
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'completed'
      ORDER BY t.created_at DESC
      LIMIT $1
    `, [limit])
    
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get transactions by member
router.get('/member/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM transactions
      WHERE user_id = $1 AND type = 'income' AND status = 'completed'
      ORDER BY created_at DESC
    `, [req.params.id])
    
    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
