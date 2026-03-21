import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import './CategoryPage.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=18`);
        setArticles(res.data.articles || []);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalArticles(res.data.pagination?.totalArticles || 0);
      } catch (err) {
        console.error('Error searching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [query, currentPage]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <header className="page-header">
        <h2 className="section-title">Search Results</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          {totalArticles} result{totalArticles !== 1 ? 's' : ''} for <strong>"{query}"</strong>
        </p>
      </header>

      {articles.length === 0 ? (
        <div className="no-news">
          <p>No results found for <strong>"{query}"</strong>.</p>
          <p style={{ marginTop: '0.5rem' }}>Try searching for a different keyword.</p>
          <Link to="/" style={{ color: 'var(--accent)', fontWeight: 600, display: 'block', marginTop: '1rem' }}>← Back to Home</Link>
        </div>
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

export default SearchPage;
