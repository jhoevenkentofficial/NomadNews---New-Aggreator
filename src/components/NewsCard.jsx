import React from 'react';
import { Link } from 'react-router-dom';
import './NewsCard.css';

const NewsCard = ({ article, variant = 'standard' }) => {
  if (!article) return null;
  const { id, title, description, image, source, published_at, category, author } = article;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not dated';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Detect if this article is from TTN / TRAVELTEW (internal)
  const isTTNSource = (src) => {
    if (!src) return true; // no source = internal
    const s = src.toLowerCase();
    return s.includes('traveltew') || s.includes('ttn news') || s.includes('ttn') || s === 'admin';
  };

  const cleanSource = (name) => {
    if (!name || isTTNSource(name)) return 'TTN News';
    // Known all-caps brands
    const upperBrands = ['cnn', 'bbc', 'nbc', 'abc', 'cbs', 'npr', 'ap', 'afp'];
    let clean = name.replace(/^www\./i, '');
    clean = clean.split('.')[0];
    if (upperBrands.includes(clean.toLowerCase())) return clean.toUpperCase();
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const isExternal = !isTTNSource(source);

  const defaultImage = `https://picsum.photos/seed/${encodeURIComponent(title)}/800/600`;
  const articleLink = `/article/${id}`;

  if (variant === 'hero') {
    return (
      <Link to={articleLink} className="news-card-hero">
        <div className="hero-image-container">
          <img src={image || defaultImage} alt={title} onError={(e) => { e.target.src = defaultImage; }} />
          <div className="category-overlay">{category}</div>
        </div>
        <div className="hero-content">
          <div className="meta-row">
            <span className="author-tag">By {cleanSource(source)}</span>
            {isExternal && <span className="source-tag">Source: {cleanSource(source)}</span>}
          </div>
          <h2 className="hero-title">{title}</h2>
          <p className="hero-desc">
            {description?.split('\n')[0]}
          </p>
          <div className="card-footer">
            <span className="repub-label">Via TTN NEWS Wire</span>
            <span className="date-tag">{formatDate(published_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'list') {
    return (
      <Link to={articleLink} className="news-card-list-item">
        <div className="list-item-content">
          <span className="list-category">{category}</span>
          <h4 className="list-title">{title}</h4>
          <div className="list-footer">
            <span className="list-source">{isExternal ? `Source: ${cleanSource(source)}` : 'TTN News'}</span>
            <span className="list-date">{formatDate(published_at)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Default: Standard (Side Image)
  return (
    <Link to={articleLink} className="news-card-standard">
      <div className="standard-image-container">
        <img src={image || defaultImage} alt={title} onError={(e) => { e.target.src = defaultImage; }} />
      </div>
      <div className="standard-content">
        <div className="meta-row">
          <span className="author-tag">By {cleanSource(source)}</span>
          <span className="category-tag">{category}</span>
        </div>
        <h3 className="standard-title">{title}</h3>
        <p className="standard-desc">
          {description?.split('\n')[0]?.substring(0, 120)}...
        </p>
        <div className="card-footer">
          <span className="source-label">{isExternal ? `Source: ${cleanSource(source)}` : 'TTN News'}</span>
          <span className="date-tag">{formatDate(published_at)}</span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;

