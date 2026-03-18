import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import './Sidebar.css';

const REGIONS = [
  'North America', 'Central America', 'Caribbean', 'South America',
  'U.K. & Ireland', 'Western Europe', 'Eastern Europe', 'Africa',
  'Middle East', 'Central Asia', 'East Asia', 'South Asia',
  'Southeast Asia', 'Oceania'
];

const Sidebar = () => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const baseUrl = window.location.origin.includes('localhost') ? 'http://localhost:5000' : '';
        const res = await axios.get(`${baseUrl}/api/news/trending`);
        setTrending(res.data.articles || []);
      } catch (err) {
        console.error('Error fetching trending news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="section-title">Latest by Region</h3>
        <div className="region-links">
          {REGIONS.map((region) => (
            <NavLink
              key={region}
              to={`/region/${encodeURIComponent(region)}`}
              className={({ isActive }) => isActive ? 'region-item active' : 'region-item'}
            >
              {region}
            </NavLink>
          ))}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h3 className="section-title">Trending</h3>
        <div className="trending-list">
          {loading ? (
            <div className="sidebar-loader"></div>
          ) : trending.length > 0 ? (
            trending.map((article, index) => (
              <a 
                key={article._id || index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="trending-item"
              >
                <div className="trending-visual">
                  <span className="trending-rank">{index + 1}</span>
                  <div className="trending-thumb">
                    <img 
                      src={article.image} 
                      alt="" 
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${article.title}/100/100`; }} 
                    />
                  </div>
                </div>
                <p className="trending-title">{article.title}</p>
              </a>
            ))
          ) : (
            <p className="no-data">No trending news available.</p>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
