const { client } = require('./api/backend/data/turso');

async function cleanup() {
  try {
    const queries = [
      "UPDATE articles SET region = 'Asia' WHERE region IN ('East Asia', 'Southeast Asia', 'South Asia', 'Central Asia')",
      "UPDATE articles SET region = 'Europe' WHERE region IN ('Western Europe', 'Eastern Europe', 'U.K. & Ireland')",
      "UPDATE articles SET region = 'South America' WHERE region IN ('Central America', 'Caribbean')"
    ];
    
    for (const q of queries) {
      const res = await client.execute(q);
      console.log(`Updated with query: ${q}, rows affected: ${res.rowsAffected}`);
    }
    console.log('Cleanup complete');
  } catch (err) {
    console.error('Cleanup failed:', err);
  }
}

cleanup();
