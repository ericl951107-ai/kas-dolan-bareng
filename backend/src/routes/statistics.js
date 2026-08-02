import express from 'express'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'

const router = express.Router()

// Get statistics
router.get('/', auth, async (req, res) => {
  try {
    // Monthly trend (last 6 months)
    const monthlyTrend = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expenses
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
        AND status = 'completed'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at)
    `)

    // Expenses by category
    const expensesByCategory = await pool.query(`
      SELECT 
        category as name,
        SUM(amount) as value
      FROM expenses
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY value DESC
    `)

    // Balance growth (last 30 days)
    const balanceGrowth = await pool.query(`
      SELECT 
        TO_CHAR(DATE_TRUNC('day', created_at), 'DD/MM') as date,
        SUM(SUM(CASE WHEN type = 'income' THEN amount WHEN type = 'expense' THEN -amount ELSE 0 END)) 
          OVER (ORDER BY DATE_TRUNC('day', created_at)) as balance
      FROM transactions
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        AND status = 'completed'
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY DATE_TRUNC('day', created_at)
    `)

    res.json({
      monthlyTrend: monthlyTrend.rows.map(row => ({
        month: row.month,
        income: parseFloat(row.income),
        expenses: parseFloat(row.expenses)
      })),
      expensesByCategory: expensesByCategory.rows.map(row => ({
        name: row.name,
        value: parseFloat(row.value)
      })),
      balanceGrowth: balanceGrowth.rows.map(row => ({
        date: row.date,
        balance: parseFloat(row.balance)
      }))
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
