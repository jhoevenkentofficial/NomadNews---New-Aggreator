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
            <span className="author-tag">By {author || 'TRAVELTEW Staff'}</span>
          </div>
          <h2 className="hero-title">{title}</h2>
          <p className="hero-desc">{description}</p>
          <div className="card-footer">
            <span className="source-label">TRAVELTEW Exclusive</span>
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
            <span className="list-source">TRAVELTEW NEWS</span>
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
          <span className="author-tag">By {author || 'TRAVELTEW Staff'}</span>
          <span className="category-tag">{category}</span>
        </div>
        <h3 className="standard-title">{title}</h3>
        <div className="card-footer">
          <span className="source-label">TRAVELTEW NEWS</span>
          <span className="date-tag">{formatDate(published_at)}</span>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;

