import express from 'express';
import pool from '../config/database.js';
import { auth } from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for QRIS image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/qris';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'qris-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan'));
    }
  }
});

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
        ('target_amount', '0', 'Target uang yang ingin dikumpulkan'),
        ('qris_image_url', '', 'URL gambar QRIS untuk pembayaran')
      `);
    } else {
      // Ensure target_amount and qris_image_url exist
      await pool.query(`
        INSERT INTO settings (key, value, description) 
        VALUES 
          ('target_amount', '0', 'Target uang yang ingin dikumpulkan'),
          ('qris_image_url', '', 'URL gambar QRIS untuk pembayaran')
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

// Upload QRIS image (admin only)
router.post('/qris', auth, adminAuth, upload.single('qris'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'File QRIS tidak ditemukan' });
    }

    const qrisUrl = `/uploads/qris/${req.file.filename}`;
    
    // Update QRIS URL in database
    await pool.query(
      'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
      [qrisUrl, 'qris_image_url']
    );

    // Log activity
    await pool.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, details) VALUES ($1, $2, $3, $4)',
      [req.user.id, 'upload_qris', 'settings', JSON.stringify({ filename: req.file.filename })]
    );

    res.json({ 
      message: 'QRIS berhasil diupload',
      qrisUrl
    });
  } catch (error) {
    console.error('Error uploading QRIS:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

export default router;
