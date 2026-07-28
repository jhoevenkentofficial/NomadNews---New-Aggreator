import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { AffiliateWidget } from './AffiliateWidget';
import { RefreshCw, Flame, Plane, Landmark, MapPin } from 'lucide-react';
import './Sidebar.css';

const REGIONS = [
  'North America', 'South America', 'Europe', 'Asia',
  'Africa', 'Middle East', 'Oceania'
];

const Sidebar = () => {
  const [trending, setTrending] = useState([]);
  const [sources, setSources] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRegions, setExpandedRegions] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, sourcesRes] = await Promise.all([
          axios.get(`${API_URL}/trending`),
          axios.get(`${API_URL}/sources`)
        ]);
        setTrending(trendingRes.data.articles || []);
        setSources(sourcesRes.data || {});
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const toggleRegion = (region) => {
    setExpandedRegions(prev => ({
      ...prev,
      [region]: !prev[region]
    }));
  };

  const handleCleanSource = (name) => {
    if (!name) return name;
    // Remove www. and then pick the main domain part
    let clean = name.replace(/^www\./i, '');
    clean = clean.split('.')[0];
    // Capitalize first letter
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      await axios.get(`${API_URL}/fetch`);
      // Wait a few seconds for the fetcher to do some work, then reload page
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('Error triggering manual refresh:', err);
      setRefreshing(false);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-section ttn-section">
        <h3 className="section-title ttn-title">TRAVELTEW — Your #1 Travel News Source</h3>
        <div className="ttn-sub-sections">
          {[
            { name: 'Breaking News', icon: <Flame size={16} /> },
            { name: 'Travel News', icon: <Plane size={16} /> },
            { name: 'Major Cities', icon: <Landmark size={16} /> },
            { name: 'Popular Destinations', icon: <MapPin size={16} /> }
          ].map(sub => (
            <NavLink 
              key={sub.name} 
              to={`/category/${sub.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={({ isActive }) => isActive ? 'ttn-item active' : 'ttn-item'}
            >
              <div className="ttn-item-icon">{sub.icon}</div>
              <span>{sub.name}</span>
            </NavLink>
          ))}
        </div>
      </div>

      <div className="sidebar-section refresh-section">
        <button 
          className={`refresh-btn ${refreshing ? 'refreshing' : ''}`} 
          onClick={handleManualRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Updating News...' : 'Update News Now'}
        </button>
      </div>

      <div className="sidebar-section sidebar-sponsored-section">
        <AffiliateWidget
          slot="sidebar"
          compact
          title="Travel Booking Tools"
        />
      </div>

      <div className="sidebar-section">
        <h3 className="section-title">World Travel News</h3>
        <div className="region-list-container">
          {loading ? (
            <div className="sidebar-loading-placeholder">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-line"></div>
              ))}
            </div>
          ) : Object.keys(sources).length > 0 ? (
            Object.entries(sources).map(([region, regionSources]) => (
              <div key={region} className="sidebar-region-group">
                <div 
                  className={`region-header ${expandedRegions[region] ? 'expanded' : ''}`}
                  onClick={() => toggleRegion(region)}
                >
                  <NavLink
                    to={`/region/${encodeURIComponent(region)}`}
                    className={({ isActive }) => isActive ? 'region-link active' : 'region-link'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {region}
                  </NavLink>
                  <span className="expand-icon">{expandedRegions[region] ? '−' : '+'}</span>
                </div>
                {expandedRegions[region] && (
                  <div className="source-list">
                    {regionSources.slice(0, 4).map((source) => (
                      <NavLink
                        key={source}
                        to={`/source/${encodeURIComponent(source)}`}
                        className={({ isActive }) => isActive ? 'source-item active' : 'source-item'}
                      >
                        {handleCleanSource(source)}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
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
          )}
        </div>
      </div>
      
      <div className="sidebar-section">
        <h3 className="section-title">Trending</h3>
        <div className="trending-list">
          {loading ? (
            <div className="sidebar-loader"></div>
          ) : trending.length > 0 ? (
            trending.map((article, index) => (
              <NavLink 
                key={article.id || article._id || index} 
                to={`/article/${article.id || article._id}`} 
                className="trending-item"
              >
                <div className="trending-visual">
                  <span className="trending-rank">{index + 1}</span>
                  <div className="trending-thumb">
                    <img 
                      src={article.image} 
                      alt="" 
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/${encodeURIComponent(article.title)}/100/100`; }} 
                    />
                  </div>
                </div>
                <p className="trending-title">{article.title}</p>
              </NavLink>
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


