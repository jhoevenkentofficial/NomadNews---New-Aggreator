const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String },
  url: { type: String, required: true, unique: true },
  image: { type: String },
  publishedAt: { type: Date, default: Date.now },
  source: {
    name: { type: String },
    url: { type: String }
  },
  region: { type: String, default: 'Global' },
  category: { type: String, default: 'Travel' },
  trending: { type: Boolean, default: false },
  trendingScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Indexing for faster searches
ArticleSchema.index({ title: 'text', description: 'text', category: 'text', region: 'text' });

module.exports = mongoose.model('Article', ArticleSchema);
