const fs = require('fs');
const path = require('path');

const regions = [
  'North America', 'Central America', 'Caribbean', 'South America', 
  'U.K. & Ireland', 'Western Europe', 'Eastern Europe', 'Africa', 
  'Middle East', 'Central Asia', 'East Asia', 'South Asia', 
  'Southeast Asia', 'Oceania'
];

const categories = ['Thailand', 'World', 'Business', 'Lifestyle', 'Travel', 'Opinion', 'Video'];

const storyTemplates = [
  "Exploring the Hidden {Feature} of {Location}",
  "Why {Location} is the Must-Visit {Type} Destination for 2026",
  "The Future of {Category} in {Region}: What to Expect",
  "Top 10 {Type} Spots in {Region} You Haven't Heard Of",
  "Local Secrets: How to Experience {Location} Like a Native",
  "The Impact of {Event} on {Region}'s Tourism Recovery",
  "Sustainable Travel: Leading {Category} Initiatives in {Region}",
  "A Weekend Guide to {Location}: {Highlight} and Beyond",
  "Luxury Reimagined: The Best {Type} Resorts in {Region}",
  "Adventure Awaits: Why {Region} is the Ultimate {Type} Hub",
  "Cultural Immersion: The Best Festivals in {Region} This Season",
  "Digital Nomad Life: Why {Location} is the New {Type} Capital",
  "Record-Breaking {Stat} Hits {Region}'s Tourism Sector",
  "New {Policy} Set to Transform {Category} in {Location}",
  "How {Location} is Redefining {Type} Travel This Year",
  "A Culinary Journey Through {Location}: Best {Type} Bites",
  "Postcard from {Location}: The {Highlight} You Can't Miss",
  "Eco-Friendly Stays: Best Green Hotels in {Region}",
  "Off the Beaten Path: Exploring {Region}'s {Feature}",
  "The Rise of {Type} Tourism in {Location}"
];

const placeholders = {
  Feature: ["Caves", "Waterfalls", "Forests", "Villages", "Markets", "Temples", "Coastlines", "Ruins", "Glaciers", "Deserts"],
  Location: {
    'North America': ["Vancouver", "New York", "Mexico City", "Miami", "Toronto", "Austin", "San Francisco"],
    'Central America': ["San Jose", "Panama City", "Antigua", "Belize City", "Granada", "San Salvador", "Leon"],
    'Caribbean': ["Havana", "San Juan", "Nassau", "Kingston", "Bridgetown", "Castries", "St. George's"],
    'South America': ["Buenos Aires", "Cusco", "Rio de Janeiro", "Bogota", "Santiago", "Quito", "Lima"],
    'U.K. & Ireland': ["Edinburgh", "Dublin", "Galway", "London", "Belfast", "Cork", "Manchester"],
    'Western Europe': ["Paris", "Amsterdam", "Lisbon", "Barcelona", "Berlin", "Rome", "Vienna"],
    'Eastern Europe': ["Prague", "Budapest", "Warsaw", "Krakow", "Tallinn", "Riga", "Vilnius"],
    'Africa': ["Cape Town", "Nairobi", "Marrakech", "Lagos", "Cairo", "Accra", "Dakar"],
    'Middle East': ["Dubai", "Doha", "Muscat", "Amman", "Riyadh", "Beirut", "Tel Aviv"],
    'Central Asia': ["Tashkent", "Almaty", "Bishkek", "Samarkand", "Dushanbe", "Astana", "Khiva"],
    'East Asia': ["Tokyo", "Seoul", "Hong Kong", "Kyoto", "Taipei", "Osaka", "Busan"],
    'South Asia': ["Mumbai", "Kathmandu", "Colombo", "Delhi", "Thimphu", "Dhaka", "Male"],
    'Southeast Asia': ["Bangkok", "Hanoi", "Bali", "Manila", "Singapore", "Phuket", "Da Nang"],
    'Oceania': ["Sydney", "Auckland", "Fiji", "Melbourne", "Bora Bora", "Perth", "Brisbane"]
  },
  Type: ["Beach", "Mountain", "Urban", "Culinary", "Historical", "Wellness", "Solo", "Family", "Backpacking", "Luxury"],
  Category: ["Travel Tech", "Eco-Tourism", "High-End", "Culture", "Digital Nomad", "Heritage"],
  Highlight: ["Street Food", "Old Town", "Nightlife", "History", "Nature", "Art Scene"],
  Event: ["New Flight Routes", "Visa Freedom", "Expo 2026", "Festival Season"],
  Policy: ["Eco-Tax", "Nomad Visa", "Rail Expansion", "Port Upgrade"],
  Stat: ["Growth", "Occupancy", "Arrivals", "Spending"]
};

const unsplashIds = [
  "1506710507534-11ef7c1a0c08", "1469475826631-7a8d59117142", "1472396963477-da568e6474fb", "1501785888041-af3ef285b470",
  "1470770841072-f978cf4d019e", "1441974231531-c6227db76b6e", "1505118380757-91f5f45d516f", "1533105079780-92b9be482077",
  "1476514525535-07fb3b4ae5f1", "1493246507139-91e8fad9978e", "1507525428034-b723cf961d3e", "1519046904884-53103b34b206",
  "1502602898757-3f33b000851f", "1499856871958-5b9627545d1a", "1523906834658-6e24ef23a6c8", "1512100356977-1439e83f5163",
  "1500530855697-b586d89ba3ee", "1520250497591-112f2f40a3f4", "1537996194471-e35a9a13d87e", "1512453979798-5eaad66f887b",
  "1504280390367-361c6d9f38f4", "1496372334404-ee99d71d3c04", "1518548419970-58e3b4079ab2", "1524231757912-21f4fe3a7200",
  "1501167786227-4cba60f6d58f", "1539367628448-4bc5c9d171c8", "1516483638261-f4dbaf036963", "1464822759023-fed622ff2c3b",
  "1503756234508-e3236e2cc9d4", "1483683393413-73ba2180ee7b", "1508739773434-c26b3d09e071", "1506197603052-3cc9c3a201bd",
  "1454496522488-7a8e488e8606", "1477959858617-67f85cf4f1df", "1449824913935-59a9fe3393d8", "1493397212122-2b85edf5292b"
];

const expandedArticles = [];

regions.forEach(region => {
  const locations = placeholders.Location[region];
  
  for (let i = 0; i < 25; i++) {
    const location = locations[i % locations.length];
    const template = storyTemplates[i % storyTemplates.length];
    const prefix = ["Exclusive:", "Update:", "Feature:", "Insight:", "Discover:", "Report:", "In-Depth:", "News:"][Math.floor(Math.random() * 8)];
    const imageId = unsplashIds[(i + region.length) % unsplashIds.length];

    let baseTitle = template
      .replace('{Location}', location)
      .replace('{Region}', region)
      .replace('{Feature}', placeholders.Feature[i % placeholders.Feature.length])
      .replace('{Type}', placeholders.Type[i % placeholders.Type.length])
      .replace('{Category}', placeholders.Category[i % placeholders.Category.length])
      .replace('{Highlight}', placeholders.Highlight[i % placeholders.Highlight.length])
      .replace('{Event}', placeholders.Event[i % placeholders.Event.length])
      .replace('{Policy}', placeholders.Policy[i % placeholders.Policy.length])
      .replace('{Stat}', placeholders.Stat[i % placeholders.Stat.length]);

    const title = `${prefix} ${baseTitle}`;
    
    // ENSURE CORRECT CATEGORY SELECTION based on keywords
    let category = "Travel";
    if (title.toLowerCase().includes('thailand')) category = "Thailand";
    else if (title.toLowerCase().includes('business') || title.toLowerCase().includes('stat') || title.toLowerCase().includes('growth')) category = "Business";
    else if (title.toLowerCase().includes('lifestyle') || title.toLowerCase().includes('culinary') || title.toLowerCase().includes('food')) category = "Lifestyle";
    else if (title.toLowerCase().includes('video') || i % 12 === 0) category = "Video";
    else if (title.toLowerCase().includes('opinion') || i % 15 === 0) category = "Opinion";
    else if (i % 7 === 0) category = "World";

    const date = new Date(new Date('2026-03-18T12:00:00Z').getTime() - (i * 3600000 * (Math.random() * 20))).toISOString();

    expandedArticles.push({
      title,
      description: `Exploring ${title.toLowerCase()}. A deep dive into the unique trends and local stories from ${location} in ${region}.`,
      content: `Full analysis and expert perspective on ${title}. Our reporters in ${region} explore the latest developments in ${category.toLowerCase()}.`,
      url: `https://nomadnews.com/articles/${region.toLowerCase().replace(/ /g, '-')}/${i}-${Date.now()}-${Math.floor(Math.random()*10000)}`,
      image: `https://picsum.photos/seed/${region}${i}${Math.floor(Math.random()*1000)}/800/600`,
      publishedAt: date,
      source: { name: "NomadNews Global", url: "https://nomadnews.com" },
      region,
      category,
      trending: Math.random() > 0.9,
      trendingScore: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString()
    });
  }
});

fs.writeFileSync(path.join(__dirname, 'news_data_unique.json'), JSON.stringify(expandedArticles, null, 2));
console.log(`Generated ${expandedArticles.length} TRULY UNIQUE articles with diverse photos.`);
