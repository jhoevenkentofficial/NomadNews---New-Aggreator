const cron = require('node-cron');
const { fetchAndSaveNews } = require('../services/newsFetcher');

const startCronJob = (io = null) => {
  // Run news fetch every hour locally
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Running scheduled news fetch...');
    await fetchAndSaveNews(io);
  });
  console.log('[Cron] News fetcher scheduled.');
};

module.exports = { startCronJob };
