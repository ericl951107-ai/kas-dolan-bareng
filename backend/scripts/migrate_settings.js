import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:ThkRlaswRKHKeoJTCTkLAbrsApJiKxii@sakura.proxy.rlwy.net:37618/kas_dolan_bareng'
});

const migrate = async () => {
  try {
    console.log('🔄 Creating settings table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Settings table created');
    
    console.log('🔄 Creating trigger function...');
    
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_settings_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    console.log('✅ Trigger function created');
    
    console.log('🔄 Creating trigger...');
    
    await pool.query(`DROP TRIGGER IF EXISTS update_settings_updated_at ON settings`);
    
    await pool.query(`
      CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
      FOR EACH ROW EXECUTE FUNCTION update_settings_updated_at()
    `);
    
    console.log('✅ Trigger created');
    
    console.log('🔄 Inserting default settings...');
    
    await pool.query(`
      INSERT INTO settings (key, value, description) VALUES
      ('bank_account_number', '1234567890', 'Nomor rekening untuk pembayaran'),
      ('bank_name', 'Bank BCA', 'Nama bank'),
      ('account_holder_name', 'Kas Dolan Bareng', 'Nama pemilik rekening')
      ON CONFLICT (key) DO NOTHING
    `);
    
    console.log('✅ Default settings inserted');
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await pool.end();
  }
};

migrate();
