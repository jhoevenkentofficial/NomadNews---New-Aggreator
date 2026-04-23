const { initDB, client } = require('./api/backend/data/turso');
const { fetchAndSaveNews } = require('./api/backend/services/newsFetcher');

async function run() {
  try {
    console.log('--- Database Initialization ---');
    await initDB();
    
    console.log('--- Triggering News Fetch ---');
    await fetchAndSaveNews();
    
    console.log('--- Verifying Data ---');
    const result = await client.execute('SELECT COUNT(*) as count FROM articles');
    const total = parseInt(result.rows[0].count, 10);
    console.log(`Verified: ${total} articles in database.`);
    
    if (total > 0) {
      const samples = await client.execute('SELECT title, category, author, city, is_breaking FROM articles LIMIT 3');
      console.log('Sample Articles:');
      console.table(samples.rows);
      
      console.log('--- Checking Category Logic ---');
      const breaking = await client.execute({
        sql: "SELECT COUNT(*) as count FROM articles WHERE category LIKE '%Breaking News%'",
        args: []
      });
      console.log(`Breaking News count: ${breaking.rows[0].count}`);
    }
    
    console.log('Verification Complete!');
    process.exit(0);
  } catch (err) {
    console.error('FAILED:', err.message);
    process.exit(1);
  }
}

run();
