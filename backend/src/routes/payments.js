import express from 'express'
import QRCode from 'qrcode'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'
import upload from '../config/upload.js'

const router = express.Router()

// Generate QR Code for payment
router.post('/generate-qr', auth, async (req, res) => {
  try {
    const { amount, description } = req.body
    const userId = req.user.id

    // Generate unique transaction ID
    const transactionId = `KAS${Date.now()}${userId}`
    
    // QR String format (sesuaikan dengan payment gateway)
    const qrString = JSON.stringify({
      transactionId,
      amount,
      merchantId: 'KAS_DOLAN_BARENG',
      userId
    })

    // Generate QR Code
    const qrCodeUrl = await QRCode.toDataURL(qrString)

    // Save to database
    await pool.query(`
      INSERT INTO payment_qr_codes (user_id, transaction_id, qr_string, amount, expires_at)
      VALUES ($1, $2, $3, $4, NOW() + INTERVAL '1 hour')
    `, [userId, transactionId, qrString, amount])

    res.json({
      transactionId,
      qrString,
      qrCodeUrl,
      expiresIn: 3600 // seconds
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Direct payment (manual) with receipt upload
router.post('/direct', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { amount, description, method } = req.body
    const userId = req.user.id
    const receiptPath = req.file ? `/uploads/receipts/${req.file.filename}` : null

    // Insert transaction with pending status (needs approval)
    const result = await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, method, receipt, status)
      VALUES ($1, 'income', $2, $3, $4, $5, 'pending')
      RETURNING *
    `, [userId, amount, description, method, receiptPath])

    res.json({
      message: 'Pembayaran berhasil dikirim. Menunggu verifikasi admin/bendahara.',
      transaction: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Approve payment (admin/bendahara only)
router.put('/approve/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const approverId = req.user.id
    
    // Check if user is admin or bendahara
    if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
      return res.status(403).json({ message: 'Hanya admin/bendahara yang bisa approve pembayaran' })
    }

    // Get transaction details
    const transactionResult = await pool.query(
      'SELECT * FROM transactions WHERE id = $1',
      [id]
    )
    
    if (transactionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' })
    }
    
    const transaction = transactionResult.rows[0]
    
    // Update transaction status to completed
    await pool.query(`
      UPDATE transactions 
      SET status = 'completed', 
          approved_by = $1, 
          approved_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [approverId, id])

    // Update user total contribution and payment status
    await pool.query(`
      UPDATE users 
      SET total_contribution = total_contribution + $1,
          payment_status = 'paid'
      WHERE id = $2
    `, [transaction.amount, transaction.user_id])
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [approverId, 'approve_payment', 'transaction', id, JSON.stringify({ amount: transaction.amount, user_id: transaction.user_id })]
    )

    res.json({ message: 'Pembayaran berhasil disetujui' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Reject payment (admin/bendahara only)
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const { id } = req.params
    const { reason } = req.body
    const approverId = req.user.id
    
    // Check if user is admin or bendahara
    if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
      return res.status(403).json({ message: 'Hanya admin/bendahara yang bisa reject pembayaran' })
    }

    // Update transaction status to failed
    await pool.query(`
      UPDATE transactions 
      SET status = 'failed', 
          approved_by = $1, 
          approved_at = CURRENT_TIMESTAMP,
          rejection_reason = $2
      WHERE id = $3
    `, [approverId, reason, id])
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
      [approverId, 'reject_payment', 'transaction', id, JSON.stringify({ reason })]
    )

    res.json({ message: 'Pembayaran ditolak' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

// Get pending payments (admin/bendahara only)
router.get('/pending', auth, async (req, res) => {
  try {
    // Check if user is admin or bendahara
    if (req.user.role !== 'admin' && req.user.role !== 'bendahara') {
      return res.status(403).json({ message: 'Akses ditolak' })
    }

    const result = await pool.query(`
      SELECT t.*, u.name as user_name, u.nickname
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.status = 'pending' AND t.type = 'income'
      ORDER BY t.created_at DESC
    `)

    res.json(result.rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
