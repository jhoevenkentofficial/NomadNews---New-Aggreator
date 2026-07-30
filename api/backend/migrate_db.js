const { createClient } = require('@libsql/client');
require('dotenv').config();

const url = process.env.TURSO_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('Missing TURSO_URL or TURSO_AUTH_TOKEN. Add them to .env before running migration.');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function migrate() {
  try {
    const columns = [
      { name: 'author', type: 'TEXT' },
      { name: 'city', type: 'TEXT' },
      { name: 'is_breaking', type: 'BOOLEAN DEFAULT 0' },
      { name: 'content', type: "TEXT DEFAULT ''" }
    ];

    for (const col of columns) {
      try {
        await client.execute(`ALTER TABLE articles ADD COLUMN ${col.name} ${col.type}`);
        console.log(`Added column: ${col.name}`);
      } catch (err) {
        if (err.message.includes('duplicate column')) {
          console.log(`Column already exists: ${col.name}`);
        } else {
          console.error(`Error adding ${col.name}:`, err.message);
        }
      }
    }
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    client.close();
  }
}

migrate();
