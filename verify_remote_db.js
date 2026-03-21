const { initDB, pool } = require('./api/backend/data/postgres');
require('dotenv').config({ path: './api/backend/.env' });

async function verify() {
  try {
    console.log('Testing remote Neon connection...');
    await initDB();
    const res = await pool.query('SELECT NOW()');
    console.log('SUCCESS! Remote DB version time:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('CONNECTION FAILED:', err.message);
    process.exit(1);
  }
}

verify();
