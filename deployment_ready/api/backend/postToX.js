const { TwitterApi } = require('twitter-api-v2');
const { client: db } = require('./data/turso');
require('dotenv').config();

const postBreakingNewsToX = async () => {
  // 1. Initialize X Client
  const xClient = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_SECRET,
  });

  const rwClient = xClient.readWrite;

  try {
    // 2. Fetch Breaking News not yet posted
    const result = await db.execute({
      sql: 'SELECT id, title, source FROM articles WHERE is_breaking = 1 AND posted_to_x = 0 ORDER BY published_at ASC LIMIT 5',
      args: []
    });

    if (result.rows.length === 0) {
      console.log('No new breaking news to post.');
      return;
    }

    for (const row of result.rows) {
      const { id, title, source } = row;
      const articleUrl = `${process.env.FRONTEND_URL}/article/${id}`;
      
      const tweetText = `🚨 BREAKING: ${title}\n\nRead more on TravelTew News: ${articleUrl}\n\n#TTN #TravelNews #${source.replace(/\s+/g, '')}`;

      try {
        console.log(`Posting to X: ${title}`);
        await rwClient.v2.tweet(tweetText);
        
        // 3. Update DB
        await db.execute({
          sql: 'UPDATE articles SET posted_to_x = 1 WHERE id = ?',
          args: [id]
        });
        
        console.log(`Successfully posted and updated DB for article ${id}`);
      } catch (tweetError) {
        console.error(`Failed to post article ${id} to X:`, tweetError.message);
      }
    }
  } catch (error) {
    console.error('X Posting Service Error:', error.message);
  }
};

// Run if called directly
if (require.main === module) {
  postBreakingNewsToX();
}

module.exports = { postBreakingNewsToX };
