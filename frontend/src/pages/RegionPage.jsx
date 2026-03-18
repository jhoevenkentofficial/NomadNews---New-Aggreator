import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import './HomePage.css';

const RegionPage = () => {
  const { regionName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page when region changes
  useEffect(() => {
    setCurrentPage(1);
  }, [regionName]);

  useEffect(() => {
    const fetchRegionNews = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');
        const decodedRegion = decodeURIComponent(regionName);
        const res = await axios.get(`${baseUrl}/api/news/region/${encodeURIComponent(decodedRegion)}?page=${currentPage}&limit=28`);
        setArticles(res.data.articles);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching region news:', err);
        setError(`Unable to load news for ${decodeURIComponent(regionName)}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchRegionNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [regionName, currentPage]);

  const decodedRegion = decodeURIComponent(regionName);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>System Notification</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">Try Again</button>
      </div>
    );
  }

  return (
    <div className="region-page">
      <header className="page-header">
        <h2 className="section-title">{decodedRegion}</h2>
      </header>

      {articles.length === 0 ? (
        <div className="no-news">No travel news found for {decodedRegion} currently.</div>
      ) : (
        <>
          <div className="news-list">
            {articles.map((article) => (
              <NewsCard key={article._id || article.url} article={article} />
            ))}
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};

export default RegionPage;
