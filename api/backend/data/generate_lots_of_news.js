const fs = require('fs');
const path = require('path');

const inputFiles = [
  'news_data_part1.json',
  'news_data_part2.json',
  'news_data_part3.json',
  'news_data_part4.json',
  'news_data_part5.json'
];

let baseArticles = [];

inputFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath));
    baseArticles = [...baseArticles, ...data];
  }
});

const expandedArticles = [];
const prefixes = ["Updated: ", "Breaking: ", "Insight: ", "Feature: ", "Report: ", "Live: "];

// Target: ~15 articles per region (14 regions * 15 = 210)
const regions = [
  'North America', 'Central America', 'Caribbean', 'South America', 
  'U.K. & Ireland', 'Western Europe', 'Eastern Europe', 'Africa', 
  'Middle East', 'Central Asia', 'East Asia', 'South Asia', 
  'Southeast Asia', 'Oceania'
];

regions.forEach(region => {
  const regionalBase = baseArticles.filter(a => a.region === region);
  if (regionalBase.length === 0) return;

  for (let i = 0; i < 15; i++) {
    const base = regionalBase[i % regionalBase.length];
    const prefix = prefixes[i % prefixes.length];
    
    const newArticle = {
      ...base,
      title: i === 0 ? base.title : `${prefix}${base.title}`,
      url: `${base.url}?v=${i}`,
      publishedAt: new Date(new Date(base.publishedAt).getTime() - (i * 3600000 * 4)).toISOString(), // Spread out over days
      createdAt: new Date().toISOString()
    };
    expandedArticles.push(newArticle);
  }
});

// Add some global news to fill up categories
const globalBase = baseArticles.filter(a => a.region === 'Global');
for (let i = 0; i < 30; i++) {
  const base = globalBase[i % globalBase.length];
  const prefix = prefixes[i % prefixes.length];
  const newArticle = {
    ...base,
    title: i === 0 ? base.title : `${prefix}${base.title}`,
    url: `${base.url}?v=g${i}`,
    publishedAt: new Date(new Date(base.publishedAt).getTime() - (i * 3600000 * 2)).toISOString(),
    createdAt: new Date().toISOString()
  };
  expandedArticles.push(newArticle);
}

fs.writeFileSync(path.join(__dirname, 'news_data_final.json'), JSON.stringify(expandedArticles, null, 2));
console.log(`Generated ${expandedArticles.length} articles in news_data_final.json`);
