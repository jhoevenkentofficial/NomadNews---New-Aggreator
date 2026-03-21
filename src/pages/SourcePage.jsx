import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import './HomePage.css'; // Reuse common styles

const SourcePage = () => {
  const { sourceName } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/source/${encodeURIComponent(sourceName)}?page=${currentPage}&limit=18`);
        setNews(res.data.articles || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
      } catch (error) {
        console.error('Error fetching source news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [sourceName, currentPage]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="region-page">
      <h1 className="page-title">News from {sourceName}</h1>
      <div className="news-list">
        {news.length > 0 ? (
          news.map((article) => (
            <NewsCard key={article._id || article.url} article={article} />
          ))
        ) : (
          <div className="no-news">No news available from this source currently.</div>
        )}
      </div>

      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default SourcePage;
