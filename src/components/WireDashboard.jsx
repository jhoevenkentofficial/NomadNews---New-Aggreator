import React from 'react';
import { Link } from 'react-router';
import NewsCard from './NewsCard';
import { AffiliateWidget } from './AffiliateWidget';
import './Dashboard.css';

const getTopAdKeys = (title) => {
  const normalizedTitle = (title || '').toLowerCase();
  if (normalizedTitle.includes('europe')) return ['trip-europe-flights'];
  if (normalizedTitle.includes('south america')) return ['trip-south-america-flights'];
  return ['trip-sea-flights'];
};

const WireDashboard = ({ news, title }) => {
  if (!news || news.length === 0) {
    return <div className="no-news">No travel news reports are available for this section currently.</div>;
  }

  const leftColNews = news.slice(0, 7);
  const centerHero = news[7] || news[0];
  const rightColNews = news.slice(8, 15);
  const categories = [...new Set(news.map(a => a.category))].filter(c => c);

  return (
    <div className="wire-dashboard">
      {title && (
        <header className="dashboard-header">
          <h2 className="dashboard-section-title">{title}</h2>
        </header>
      )}

      <AffiliateWidget
        slot="listingTop"
        keys={getTopAdKeys(title)}
        compact
        title={title ? `${title} Travel Offers` : 'Flight Deals for Travel Readers'}
      />

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

      {news.length >= 12 && (
        <AffiliateWidget
          slot="listingMid"
          keys={['klook']}
          title="Tours Worth Booking"
        />
      )}

      <div className="category-blocks-grid">
        {categories.slice(0, 8).map((cat, catIndex) => {
          const catArticles = news.filter(a => a.category === cat).slice(0, 4);
          if (catArticles.length < 2) return null;

          const sponsoredAfter = {
            1: { keys: ['kiwi-flights'], title: 'Compare Flight Options' },
            3: { keys: ['getrentacar'], title: 'Car Hire for Readers' },
            5: { keys: ['compensair'], title: 'Flight Delay Support' }
          }[catIndex];
          
          return (
            <React.Fragment key={cat}>
              <div className="category-block">
                <div className="block-header">
                  <h2>{cat}</h2>
                  <Link to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`} className="block-more">
                    MORE {cat.toUpperCase()} -
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
              {sponsoredAfter && (
                <div className="category-sponsored">
                  <AffiliateWidget
                    slot="listingMid"
                    keys={sponsoredAfter.keys}
                    title={sponsoredAfter.title}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default WireDashboard;
