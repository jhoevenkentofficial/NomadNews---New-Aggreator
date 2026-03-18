const db = require('./data/database');
const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const path = require('path');

const dataFiles = [
  'news_data_unique.json',
  'flights_data.json'
];

let newsData = [];

dataFiles.forEach(file => {
  const filePath = path.join(__dirname, 'data', file);
  if (fs.existsSync(filePath)) {
    const rawData = fs.readFileSync(filePath);
    const jsonData = JSON.parse(rawData);
    newsData = [...newsData, ...jsonData];
  }
});

async function seedDB() {
  try {
    console.log(`Clearing database and seeding with ${newsData.length} UNIQUE articles...`);
    
    // Clear DB to ensure fresh start
    await db.remove({}, { multi: true });
    
    for (const news of newsData) {
      await db.insert(news);
    }

    console.log(`Successfully seeded local database with ${newsData.length} unique travel and flight news items.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding local database:', error);
    process.exit(1);
  }
}

seedDB();
