import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const categories = [
    'Thailand', 'World', 'Business', 'Lifestyle', 'Travel', 'Flights', 'Opinion', 'Video'
  ];

  const regions = [
    'North America', 'Western Europe', 'East Asia', 'Southeast Asia',
    'South Asia', 'Africa', 'Middle East', 'Oceania'
  ];

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const formatDateTime = (date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${dayName}, ${dateStr} · ${timeStr}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-top">
          <div className="navbar-container">
            <div className="top-left">
              <span className="live-date">{formatDateTime(currentDateTime)}</span>
            </div>
            <div className="top-right">
              <Link to="/login" className="top-link">Login</Link>
            </div>
          </div>
        </div>

        <div className="navbar-middle">
          <div className="navbar-container">
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="navbar-logo">
              <h1>NOMAD<span>NEWS</span></h1>
            </Link>
            <div className="middle-right">
              <button className="search-toggle" onClick={() => setSearchOpen(!searchOpen)} aria-label="Toggle search">
                {searchOpen ? <X size={22} /> : <Search size={22} />}
              </button>
            </div>
          </div>
        </div>

        <div className={`search-bar-container ${searchOpen ? 'open' : ''}`}>
          <div className="navbar-container">
            <form onSubmit={handleSearch} className="search-form">
              <Search size={18} className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search for news, topics, regions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              />
              <button type="submit" className="search-submit">Search</button>
            </form>
          </div>
        </div>

        <div className="navbar-bottom">
          <div className="navbar-container">
            <ul className="nav-links">
              {categories.map(cat => (
                <li key={cat}><Link to={`/category/${cat.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{cat}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Rich Mobile Slide-Out Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="mobile-menu-header">
          <div>
            <h2 className="mobile-logo">NOMAD<span>NEWS</span></h2>
            <p className="mobile-tagline">Your world. Your news.</p>
          </div>
          <button className="mobile-close-btn" onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        {/* About Section */}
        <div className="mobile-section">
          <h3 className="mobile-section-title">About NomadNews</h3>
          <p className="mobile-about-text">
            NomadNews Global is your premier source for international travel news, cultural stories, 
            and world events — covering every corner of the globe from breaking aviation news to hidden 
            destinations you'll want to visit next.
          </p>
        </div>

        {/* Categories */}
        <div className="mobile-section">
          <h3 className="mobile-section-title">Browse by Category</h3>
          <div className="mobile-category-grid">
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase()}`}
                className="mobile-category-chip"
                onClick={() => setMenuOpen(false)}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Regions */}
        <div className="mobile-section">
          <h3 className="mobile-section-title">Top Regions</h3>
          <div className="mobile-nav">
            {regions.map(region => (
              <Link
                key={region}
                to={`/region/${encodeURIComponent(region)}`}
                className="mobile-nav-link"
                onClick={() => setMenuOpen(false)}
              >
                {region}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mobile-section mobile-footer-info">
          <p>479+ unique stories updated daily</p>
          <p>Powered by GNews API & RSS Feeds</p>
          <p style={{ marginTop: '0.5rem', color: 'var(--accent)', fontWeight: 600 }}>
            © 2026 NomadNews Global
          </p>
        </div>
      </div>

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
};

export default Navbar;
