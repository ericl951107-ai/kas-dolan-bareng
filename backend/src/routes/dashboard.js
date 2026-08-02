import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total balance (income - expenses)
    const balanceResult = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_balance,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
      FROM transactions
      WHERE status = 'completed'
    `)

    // Get total members
    const membersResult = await pool.query('SELECT COUNT(*) as total_members FROM users')

    res.json({
      totalBalance: parseFloat(balanceResult.rows[0].total_balance),
      totalIncome: parseFloat(balanceResult.rows[0].total_income),
      totalExpenses: parseFloat(balanceResult.rows[0].total_expenses),
      totalMembers: parseInt(membersResult.rows[0].total_members)
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get chart data for last 7 days
router.get('/chart-data', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', created_at), 'DD/MM') as date,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
        AND status = 'completed'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at)
    `)

    res.json(result.rows.map(row => ({
      date: row.date,
      income: parseFloat(row.income),
      expenses: parseFloat(row.expenses)
    })))
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
