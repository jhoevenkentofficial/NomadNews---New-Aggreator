import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import WireDashboard from '../components/WireDashboard';

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/latest?limit=60`);
        if (res.data && res.data.articles) {
          setNews(res.data.articles);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (error) return <div className="error-state"><h2>Error Loading News</h2><p>{error}</p></div>;
  
  return <WireDashboard news={news} />;
};

export default HomePage;
