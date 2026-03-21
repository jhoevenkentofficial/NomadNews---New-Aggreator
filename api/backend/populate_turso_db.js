const { createClient } = require('@libsql/client');
const { fetchAndSaveNews } = require('./services/newsFetcher');

const url = 'libsql://nomad-news-randompro.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQxMjI2NTQsImlkIjoiMDE5ZDExZjEtMGEwMS03ODcwLThkODMtZjIwMWNmNzExNzhiIiwicmlkIjoiNjlkZWNmNTEtZjg4Mi00OWVhLWE3ZmEtMTY5ZjAxMjQwOGU0In0.zCezOAqItpOP8SNTRJgPppO-SHz795-q_AAVpV_tgAZX2NVxHuJGRRilR0nvoXPztaM8tUSPw-udYgH69rI8Aw';

// Standalone client logic
process.env.TURSO_URL = url;
process.env.TURSO_AUTH_TOKEN = authToken;

async function run() {
  try {
    console.log('Connecting to REMOTE Turso Standalone...');
    const { initDB } = require('./data/turso');
    await initDB();

    console.log('Fetching News to Cloud...');
    await fetchAndSaveNews();
    console.log('SUCCESS: News populated to cloud!');
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    process.exit(1);
  }
}

run();
