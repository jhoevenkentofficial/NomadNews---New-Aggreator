const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_URL || process.env.DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({
  url: url || 'file:local.db',
  authToken: authToken,
});

let isInitialized = false;

const initDB = async () => {
  if (isInitialized) return client;

  try {
    if (!url && !process.env.DATABASE_URL) {
      console.warn("TURSO_URL or DATABASE_URL is missing from environment variables. Falling back to local file.");
    }

    // Create articles table using SQLite syntax
    await client.execute(`
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
    
    // Create necessary indexes
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_region ON articles(region)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(trending)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)`);

    console.log('Turso (Cloud SQLite): Articles table and indexes initialized successfully.');
    isInitialized = true;
  } catch (error) {
    console.error(`Turso Initialization Error: ${error.message}`);
  }

  return client;
};

module.exports = {
  client,
  initDB
};
