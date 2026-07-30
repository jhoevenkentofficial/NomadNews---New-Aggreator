const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN. Add them to .env before populating Turso.');
  process.exit(1);
}

process.env.TURSO_URL = url;
process.env.TURSO_AUTH_TOKEN = authToken;

const { initDB } = require('./data/turso');
const { fetchAndSaveNews } = require('./services/newsFetcher');

(async () => {
  try {
    console.log('Initializing DB...');
    await initDB();
    console.log('Fetching news into Turso...');
    await fetchAndSaveNews();
    console.log('Done.');
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    process.exit(1);
  }
})();
