const { fetchAndSaveNews } = require('./api/backend/services/newsFetcher');
require('dotenv').config();

if (!process.env.TURSO_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN. Set them in your environment before running this helper.');
  process.exit(1);
}

async function run() {
  try {
    console.log('Fetching news to configured Turso database...');
    await fetchAndSaveNews();
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    process.exit(1);
  }
}

run();
