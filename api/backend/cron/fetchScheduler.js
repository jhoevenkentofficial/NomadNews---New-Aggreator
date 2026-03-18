const cron = require('node-cron');
const { fetchAndSaveNews } = require('../services/newsFetcher');

function startCronJob(io) {
  console.log('Initializing News Fetcher Cron Job with Real-Time Updates...');
  
  // Run once on startup
  fetchAndSaveNews(io);
  
  // Schedule to run every hour
  cron.schedule('0 * * * *', () => {
    console.log('Running periodic news fetch job...');
    fetchAndSaveNews(io);
  });
}

module.exports = {
  startCronJob
};
