import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:ThkRlaswRKHKeoJTCTkLAbrsApJiKxii@sakura.proxy.rlwy.net:37618/kas_dolan_bareng'
});

const check = async () => {
  try {
    const result = await pool.query('SELECT * FROM settings');
    console.log('✅ Settings table exists!');
    console.log('📊 Current settings:', result.rows);
  } catch (error) {
    if (error.message.includes('does not exist')) {
      console.log('❌ Settings table does not exist yet');
      console.log('🔄 Creating it now...');
      
      // Create table
      await pool.query(`
        CREATE TABLE settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT,
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert defaults
      await pool.query(`
        INSERT INTO settings (key, value, description) VALUES
        ('bank_account_number', '1234567890', 'Nomor rekening untuk pembayaran'),
        ('bank_name', 'Bank BCA', 'Nama bank'),
        ('account_holder_name', 'Kas Dolan Bareng', 'Nama pemilik rekening')
      `);
      
      console.log('✅ Settings table created with default values!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await pool.end();
  }
};

check();
