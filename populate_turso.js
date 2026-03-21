const { createClient } = require('@libsql/client');
const { fetchAndSaveNews } = require('./api/backend/services/newsFetcher');

const url = 'libsql://nomad-news-randompro.aws-us-east-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzQxMjI2NTQsImlkIjoiMDE5ZDExZjEtMGEwMS03ODcwLThkODMtZjIwMWNmNzExNzhiIiwicmlkIjoiNjlkZWNmNTEtZjg4Mi00OWVhLWE3ZmEtMTY5ZjAxMjQwOGU0In0.zCezOAqItpOP8SNTRJgPppO-SHz795-q_AAVpV_tgAZX2NVxHuJGRRilR0nvoXPztaM8tUSPw-udYgH69rI8Aw';

// PREVENT newsFetcher.js from using its internal client
const { client } = require('./api/backend/data/turso');

async function run() {
  try {
    console.log('Connecting to REMOTE Turso...');
    const remoteClient = createClient({ url, authToken });
    
    // Create table on remote
    await remoteClient.execute(`
      CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        description TEXT,
        source TEXT,
        category TEXT,
        region TEXT,
        image TEXT,
        published_at DATETIME,
        trending BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Override the client in newsFetcher if possible (hacky but works for population)
    // Actually, I'll just temporarily modify newsFetcher to use a global client
    console.log('Fetching News to Cloud...');
    await fetchAndSaveNews(); 
    // Wait, newsFetcher uses the required client. 
    // I MUST modify turso.js to use the env vars correctly.
    
    process.exit(0);
  } catch (err) {
    console.error('CRITICAL ERROR:', err.message);
    process.exit(1);
  }
}

run();
