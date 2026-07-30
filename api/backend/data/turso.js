const { createClient } = require('@libsql/client');
require('dotenv').config();

let url = (process.env.TURSO_URL || '').trim();
const authToken = (process.env.TURSO_AUTH_TOKEN || '').trim();

if (url.includes('?')) {
  url = url.split('?')[0];
}

const rawClient = createClient({
  url: url || 'file:local.db',
  authToken: authToken,
});

let isInitialized = false;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isTransientDbError = (error) => {
  const message = String(error?.message || error || '').toLowerCase();
  return [
    'enotfound',
    'econnreset',
    'econnrefused',
    'etimedout',
    'network',
    'fetch failed',
    'temporarily unavailable',
    'timeout'
  ].some((needle) => message.includes(needle));
};

const executeWithRetry = async (statement, options) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await rawClient.execute(statement, options);
    } catch (error) {
      if (attempt === maxAttempts || !isTransientDbError(error)) {
        throw error;
      }

      await sleep(250 * attempt);
    }
  }
};

const client = new Proxy(rawClient, {
  get(target, prop) {
    if (prop === 'execute') return executeWithRetry;
    const value = target[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  }
});

const initDB = async () => {
  if (isInitialized) return client;

  try {
    if (!url) {
      console.warn("TURSO_URL is missing from environment variables. Falling back to local file.");
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
      { name: 'is_breaking', type: 'BOOLEAN DEFAULT 0' },
      { name: 'content', type: "TEXT DEFAULT ''" }
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
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_region_source ON articles(region, source)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(trending)`);
    await client.execute(`CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)`);

    console.log('Turso (Cloud SQLite): Articles table and indexes initialized successfully.');
    isInitialized = true;
  } catch (error) {
    console.error(`Turso Initialization Error: ${error.message}`);
  }

  return client;
};

const closeDB = () => {
  if (typeof client.close === 'function') {
    client.close();
  }
};
module.exports = {
  client,
  initDB,
  closeDB
};
