import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import WireDashboard from '../components/WireDashboard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}&limit=60`);
        setArticles(res.data.articles || []);
      } catch (err) {
        console.error('Error searching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

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
