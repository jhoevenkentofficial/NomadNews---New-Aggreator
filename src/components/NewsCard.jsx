import React from 'react';
import './NewsCard.css';

const NewsCard = ({ article, isHero = false }) => {
  const { title, description, image, source, publishedAt, url, region, category } = article;
  
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const defaultImage = `https://picsum.photos/seed/${title}/800/600`;

  if (isHero) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="news-card-hero">
        <div className="hero-image-container">
          <img 
            src={image || defaultImage} 
            alt={title} 
            onError={(e) => { e.target.src = defaultImage; }} 
          />
          <div className="hero-badge">{region}</div>
          <div className="category-badge">{category}</div>
        </div>
        <div className="hero-content">
          <span className="source-tag">{source}</span>
          <h2 className="hero-title">{title}</h2>
          <p className="hero-desc">{description}</p>
          <span className="date-tag">{formatDate(publishedAt)}</span>
        </div>
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="news-card-standard">
      <div className="standard-image-container">
        <img 
          src={image || defaultImage} 
          alt={title} 
          onError={(e) => { e.target.src = defaultImage; }} 
        />
      </div>
      <div className="standard-content">
        <div className="meta-row">
          <span className="source-tag">{source}</span>
          <span className="category-tag">{category}</span>
        </div>
        <h3 className="standard-title">{title}</h3>
        <span className="date-tag">{formatDate(publishedAt)}</span>
      </div>
    </a>
  );
};

export default NewsCard;
