const { createClient } = require('@libsql/client');
require('dotenv').config();

let url = (process.env.TURSO_URL || process.env.DATABASE_URL || '').trim();
const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

// Support for legacy DATABASE_URL which might have sslmode (unsupported by Turso)
if (url.includes('?')) {
  url = url.split('?')[0];
}

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
        author TEXT,
        city TEXT,
        is_breaking BOOLEAN DEFAULT 0,
        trending BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Schema Migration: Add missing columns if table already existed
    const migrationColumns = [
      { name: 'author', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'is_breaking', type: 'BOOLEAN DEFAULT 0' }
    ];

    for (const col of migrationColumns) {
      try {
        await client.execute(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Migration: Added column ${col.name} to articles table.`);
      } catch (e) {
        // Catch error if column already exists
      }
    }
    
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
