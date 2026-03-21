// FORCE the URL before anything else
const REMOTE_URL = 'postgresql://neondb_owner:npg_WRLYpF0jTcO5@ep-misty-salad-anyzdaa7-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require';
process.env.POSTGRES_URL = REMOTE_URL;

// Now require the DB module
const { initDB, pool } = require('./api/backend/data/postgres');
const { fetchAndSaveNews } = require('./api/backend/services/newsFetcher');

async function run() {
  try {
    console.log('Connecting to Remote DB...');
    // Overwrite the pool's connection string just in case
    pool.options.connectionString = REMOTE_URL;
    
    await initDB();
    console.log('Fetching News...');
    await fetchAndSaveNews();
    console.log('POPULATION COMPLETE!');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    process.exit(1);
  }
}

run();
