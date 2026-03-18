const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true, unique: true },
  description: String,
  source: String,
  category: String,
  image: String,
  publishedAt: { type: Date, default: Date.now },
  trending: { type: Boolean, default: false }
}, { timestamps: true });

ArticleSchema.index({ title: 'text', description: 'text' });
ArticleSchema.index({ category: 1 });
ArticleSchema.index({ publishedAt: -1 });

module.exports = mongoose.models.Article || mongoose.model('Article', ArticleSchema);
