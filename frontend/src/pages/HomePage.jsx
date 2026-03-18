import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import './HomePage.css';

const HomePage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchLatestNews = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const res = await axios.get(`${baseUrl}/api/news/latest?page=${currentPage}&limit=28`);
        setNews(res.data.articles);
        setTotalPages(res.data.pagination.totalPages);
      } catch (error) {
        console.error('Error fetching latest news:', error);
        // Optionally, you could add an error state here if you want to display an error message
      } finally {
        setLoading(false);
      }
    };

    fetchLatestNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const heroArticle = news.length > 0 ? news[0] : null;
  const listArticles = news.length > 1 ? news.slice(1) : [];

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }


  return (
    <div className="homepage-news">
      {heroArticle ? (
        <NewsCard article={heroArticle} isHero={true} />
      ) : (
        <div className="no-news">No travel news available currently.</div>
      )}

      <div className="news-list">
        {listArticles.map((article) => (
          <NewsCard key={article._id || article.url} article={article} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
