import express from 'express';
import pool from '../config/database.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = express.Router();

// Get all settings
router.get('/', auth, async (req, res) => {
  try {
    // Check if settings table exists, if not create it
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'settings'
      )
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Create settings table
      await pool.query(`
        CREATE TABLE settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default values
      await pool.query(`
        INSERT INTO settings (key, value, description) VALUES
        ('bank_account_number', '1234567890', 'Nomor rekening untuk pembayaran'),
        ('bank_name', 'Bank BCA', 'Nama bank'),
        ('account_holder_name', 'Kas Dolan Bareng', 'Nama pemilik rekening'),
        ('target_amount', '0', 'Target uang yang ingin dikumpulkan')
      `);
    } else {
      // Ensure target_amount exists
      await pool.query(`
        INSERT INTO settings (key, value, description) 
        VALUES ('target_amount', '0', 'Target uang yang ingin dikumpulkan')
        ON CONFLICT (key) DO NOTHING
      `);
    }
    
    const result = await pool.query('SELECT * FROM settings');
    
    // Convert to key-value object
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Update settings (admin only)
router.put('/', auth, adminAuth, async (req, res) => {
  const { bank_account_number, bank_name, account_holder_name, target_amount } = req.body;
  
  try {
    // Update bank account number
    if (bank_account_number !== undefined) {
      await pool.query(
        'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [bank_account_number, 'bank_account_number']
      );
    }
    
    // Update bank name
    if (bank_name !== undefined) {
      await pool.query(
        'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [bank_name, 'bank_name']
      );
    }
    
    // Update account holder name
    if (account_holder_name !== undefined) {
      await pool.query(
        'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [account_holder_name, 'account_holder_name']
      );
    }
    
    // Update target amount
    if (target_amount !== undefined) {
      await pool.query(
        'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
        [target_amount.toString(), 'target_amount']
      );
    }
    
    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'update_settings', 'settings', JSON.stringify(req.body)]
    );
    
    res.json({ message: 'Pengaturan berhasil diperbarui' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

export default router;
