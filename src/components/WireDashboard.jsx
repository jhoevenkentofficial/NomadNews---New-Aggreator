import React from 'react';
import { Link } from 'react-router-dom';
import NewsCard from './NewsCard';
import './Dashboard.css';

const WireDashboard = ({ news, title }) => {
  if (!news || news.length === 0) {
    return <div className="no-news">No travel news reports are available for this section currently.</div>;
  }

  // 1. Partition for Hero Grid (Top Section)
  // We use slightly offset slices to make it feel fresh
  const leftColNews = news.slice(0, 7);
  const centerHero = news[7] || news[0];
  const rightColNews = news.slice(8, 15);

  // 2. Group by Categories for lower blocks
  // We only show category blocks if we aren't already looking at a specific category
  const categories = [...new Set(news.map(a => a.category))].filter(c => c);

  return (
    <div className="wire-dashboard">
      {title && (
        <header className="dashboard-header">
          <h2 className="dashboard-section-title">{title}</h2>
        </header>
      )}

      {/* SECTION 1: HERO WIRE GRID */}
      <section className="hero-grid-section">
        <div className="hero-column-side">
          <h3 className="column-title">Latest Headlines</h3>
          {leftColNews.map((a, idx) => <NewsCard key={`${a.id}-${idx}`} article={a} variant="list" />)}
        </div>
        
        <div className="hero-main-feature">
          <NewsCard article={centerHero} variant="hero" />
        </div>

        <div className="hero-column-side">
          <h3 className="column-title">Trending Alerts</h3>
          {rightColNews.map((a, idx) => <NewsCard key={`${a.id}-${idx}`} article={a} variant="list" />)}
        </div>
      </section>

      {/* SECTION 2: CATEGORY WIRE BLOCKS */}
      <div className="category-blocks-grid">
        {categories.slice(0, 8).map(cat => {
          const catArticles = news.filter(a => a.category === cat).slice(0, 4);
          if (catArticles.length < 2) return null;
          
          return (
            <div key={cat} className="category-block">
              <div className="block-header">
                <h2>{cat}</h2>
                <Link to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`} className="block-more">
                  MORE {cat.toUpperCase()} →
                </Link>
              </div>
              <div className="block-content">
                <NewsCard article={catArticles[0]} variant="standard" />
                <div className="block-list-subset">
                  {catArticles.slice(1).map((a, idx) => (
                    <NewsCard key={`${a.id}-${idx}`} article={a} variant="list" />
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WireDashboard;
