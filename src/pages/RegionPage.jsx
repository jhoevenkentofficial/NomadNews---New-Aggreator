import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import WireDashboard from '../components/WireDashboard';

const RegionPage = () => {
  const { regionName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // High density fetch
        const res = await axios.get(`${API_URL}/region/${encodeURIComponent(regionName)}?limit=60`);
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching region news:', err);
        setError(`Unable to load news for ${decodeURIComponent(regionName)}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [regionName]);

  const decodedRegion = decodeURIComponent(regionName);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (error) return <div className="error-state"><h2>Error</h2><p>{error}</p></div>;

  return <WireDashboard news={articles} title={decodedRegion} />;
};

export default RegionPage;
