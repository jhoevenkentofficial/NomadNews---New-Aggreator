const cron = require('node-cron');
const { fetchAndSaveNews } = require('../services/newsFetcher');

let isFetching = false;

const startCronJob = (io = null) => {
  const schedule = process.env.CRON_SCHEDULE || '0 * * * *';

  if (!cron.validate(schedule)) {
    console.error(`[Cron] Invalid schedule "${schedule}". News fetcher was not started.`);
    return null;
  }

  const task = cron.schedule(schedule, async () => {
    if (isFetching) {
      console.warn('[Cron] Previous news fetch is still running; skipping this cycle.');
      return;
    }

    isFetching = true;
    console.log('[Cron] Running scheduled news fetch...');

    try {
      await fetchAndSaveNews(io);
      console.log('[Cron] Scheduled news fetch complete.');
    } catch (error) {
      console.error('[Cron] Scheduled news fetch failed:', error.message);
    } finally {
      isFetching = false;
    }
  });

  console.log(`[Cron] News fetcher scheduled: ${schedule}`);
  return task;
};

module.exports = { startCronJob };
