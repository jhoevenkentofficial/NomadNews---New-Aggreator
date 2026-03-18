import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reset page to 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryName]);

  useEffect(() => {
    const fetchCategoryNews = async () => {
      try {
        setLoading(true);
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        
        // Transform categoryName to match backend seed (e.g., 'business' -> 'Business')
        const formattedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
        
        const res = await axios.get(`${baseUrl}/api/news/category/${encodeURIComponent(formattedCategory)}?page=${currentPage}&limit=28`);
        setArticles(res.data.articles);
        setTotalPages(res.data.pagination.totalPages);
      } catch (err) {
        console.error('Error fetching category news:', err);
        setError(`Unable to load news for ${categoryName}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryName, currentPage]);

  const displayTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

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
    <div className="category-page">
      <header className="page-header">
        <h2 className="section-title">{displayTitle}</h2>
      </header>

      {articles.length === 0 ? (
        <div className="no-news">No news found for {displayTitle} currently.</div>
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

export default CategoryPage;
