import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { Search, Menu, X, Landmark, Plane, Hotel, Globe, Flame, MapPin, Home, Lock } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const categories = [
    'Breaking News', 'Travel News', 'Major Cities', 'Popular Destinations'
  ];

  const regions = [
    'North America', 'Europe', 'Middle East', 'Asia', 'South America', 'Africa', 'Oceania'
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

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Breaking News': return <Flame size={16} />;
      case 'Travel News': return <Plane size={16} />;
      case 'Major Cities': return <Landmark size={16} />;
      case 'Popular Destinations': return <MapPin size={16} />;
      default: return <Globe size={16} />;
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
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/admin" className="nav-link login-link">Admin Login</Link>
            </div>
          </div>
        </div>

        <div className="navbar-middle">
          <div className="navbar-container">
            <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="navbar-brand-centered">
              <div className="logo-wrapper">
                <img src="/assets/images/logo.jpg" alt="TRAVELTEW NEWS" className="navbar-logo-img" />
              </div>
              <div className="navbar-logo-text">
                <h1 className="brand-name">TRAVELTEW<span>NEWS</span></h1>
                <p className="brand-tagline">Your #1 Travel News Source Worldwide</p>
              </div>
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
                <li key={cat}>
                  <Link 
                    to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`} 
                    onClick={() => setMenuOpen(false)}
                    className="nav-cat-link"
                  >
                    {getCategoryIcon(cat)}
                    <span>{cat}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Simplified Mobile Slide-Out Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <div className="mobile-logo-container">
            <img src="/assets/images/logo.jpg" alt="TRAVELTEW NEWS" className="mobile-logo-img" />
            <h2 className="mobile-logo">TRAVELTEW<span>NEWS</span></h2>
          </div>
          <button className="mobile-close-btn" onClick={() => setMenuOpen(false)}>
            <X size={22} />
          </button>
        </div>

        <div className="mobile-menu-content">
          <NavLink to="/" className="mobile-nav-item" onClick={() => setMenuOpen(false)}>
            <Home size={20} />
            <span>Home</span>
          </NavLink>
          
          <div className="mobile-section">
            <h3 className="mobile-section-title">Explore Categories</h3>
            <div className="mobile-category-list">
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  className="mobile-category-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="cat-icon-circle">
                    {getCategoryIcon(cat)}
                  </div>
                  <span>{cat}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mobile-footer-actions">
            <NavLink to="/admin" className="mobile-nav-item login-item" onClick={() => setMenuOpen(false)}>
              <Lock size={18} />
              <span>Admin Dashboard</span>
            </NavLink>
            <div className="mobile-menu-footer">
              <p className="mobile-tagline">Worldwide Travel News</p>
              <p className="copyright">© 2026 TRAVELTEW NEWS</p>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
};

export default Navbar;

