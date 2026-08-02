import express from 'express'
import QRCode from 'qrcode'
import pool from '../config/database.js'
import { auth } from '../middleware/auth.js'

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

// Direct payment (manual)
router.post('/direct', auth, async (req, res) => {
  try {
    const { amount, description, method } = req.body
    const userId = req.user.id

    // Insert transaction
    const result = await pool.query(`
      INSERT INTO transactions (user_id, type, amount, description, method, status)
      VALUES ($1, 'income', $2, $3, $4, 'completed')
      RETURNING *
    `, [userId, amount, description, method])

    // Update user total contribution
    await pool.query(`
      UPDATE users 
      SET total_contribution = total_contribution + $1,
          payment_status = 'paid'
      WHERE id = $2
    `, [amount, userId])

    res.json({
      message: 'Pembayaran berhasil',
      transaction: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
