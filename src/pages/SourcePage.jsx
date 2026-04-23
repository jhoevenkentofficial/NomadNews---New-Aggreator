import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import WireDashboard from '../components/WireDashboard';

const SourcePage = () => {
  const { sourceName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/source/${encodeURIComponent(sourceName)}?limit=60`);
        setNews(res.data.articles || []);
      } catch (error) {
        console.error('Error fetching source news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sourceName]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;

  const cleanSourceTitle = (name) => {
    if (!name) return 'Source';
    let clean = name.replace(/^www\./i, '').split('.')[0];
    return clean.charAt(0).toUpperCase() + clean.slice(1);
  };

  return <WireDashboard news={news} title={`Reports from ${cleanSourceTitle(sourceName)}`} />;
};

export default SourcePage;
