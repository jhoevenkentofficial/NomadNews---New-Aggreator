import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import WireDashboard from '../components/WireDashboard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(Boolean(query.trim()));
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=60`);
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error('Error searching news:', err);
        setError('Unable to complete this search right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  if (!query.trim()) {
    return (
      <div className="error-state">
        <h2>Search TTN News</h2>
        <p>Enter a keyword from the search bar to find travel reports, destinations, airlines, and breaking updates.</p>
        <Link to="/" className="btn-retry">Return Home</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Search Unavailable</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">Try Again</button>
      </div>
    );
  }

  return (
    <div className="search-page">
      <WireDashboard
        news={articles}
        title={`Search Results for "${query}"`}
      />
    </div>
  );
};

export default SearchPage;