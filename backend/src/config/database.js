import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.on('connect', () => {
  console.log('✅ Database connected')
})

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err)
})

// Run migrations on startup
export async function runMigrations() {
  try {
    // Add approval fields to transactions
    await pool.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS approved_by INTEGER REFERENCES users(id),
      ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `)

    // Add email verification fields to users
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS verification_code VARCHAR(6),
      ADD COLUMN IF NOT EXISTS verification_expires TIMESTAMP
    `)

    // Create targets table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target_amount DECIMAL(15, 2) NOT NULL,
        current_amount DECIMAL(15, 2) DEFAULT 0,
        per_person_amount DECIMAL(15, 2) DEFAULT 0,
        deadline DATE,
        status VARCHAR(50) DEFAULT 'active',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create settings table if not exists with defaults
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Insert default settings
    await pool.query(`
      INSERT INTO settings (key, value, description) VALUES
      ('bank_account_number', '1234567890', 'Nomor rekening untuk pembayaran'),
      ('bank_name', 'Bank BCA', 'Nama bank'),
      ('account_holder_name', 'Kas Dolan Bareng', 'Nama pemilik rekening'),
      ('target_amount', '0', 'Target uang yang ingin dikumpulkan')
      ON CONFLICT (key) DO NOTHING
    `)

    // Make existing users verified (for backward compat)
    await pool.query(`
      UPDATE users SET is_verified = true WHERE is_verified IS NULL OR is_verified = false
    `)

    console.log('✅ Migrations completed')
  } catch (err) {
    console.error('❌ Migration error:', err.message)
  }
}

export default pool
