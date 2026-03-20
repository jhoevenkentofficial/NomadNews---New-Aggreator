const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Use POSTGRES_URL for Vercel and Neon compatibility
const connectionString = process.env.POSTGRES_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

let isInitialized = false;

const initDB = async () => {
  if (isInitialized) return pool;

  try {
    if (!connectionString) {
      console.warn("POSTGRES_URL is missing from environment variables");
      return pool;
    }

    const client = await pool.connect();
    console.log(`PostgreSQL Connected: ${client.host}`);

    // Create articles table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        url TEXT UNIQUE NOT NULL,
        description TEXT,
        source VARCHAR(255),
        category VARCHAR(100),
        region VARCHAR(100),
        image TEXT,
        published_at TIMESTAMP WITH TIME ZONE,
        trending BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create necessary indexes for efficient querying
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_region ON articles(region)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_trending ON articles(trending)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)`);

    console.log('PostgreSQL: Articles table and indexes initialized successfully.');
    client.release();
    isInitialized = true;
  } catch (error) {
    console.error(`PostgreSQL Initialization Error: ${error.message}`);
    // Do not throw in serverless; let requests try to handle error
  }

  return pool;
};

module.exports = {
  pool,
  initDB
};
