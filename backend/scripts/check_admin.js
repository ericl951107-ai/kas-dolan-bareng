import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://postgres:ThkRlaswRKHKeoJTCTkLAbrsApJiKxii@sakura.proxy.rlwy.net:37618/kas_dolan_bareng'
});

const checkAdmin = async () => {
  try {
    const result = await pool.query(`
      SELECT id, email, name, role 
      FROM users 
      WHERE email = 'admin@kasdolan.com'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user found:');
      console.log(JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
};

checkAdmin();
