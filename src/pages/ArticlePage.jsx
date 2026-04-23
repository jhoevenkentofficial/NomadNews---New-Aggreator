import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import { ArrowLeft, ExternalLink, Share2, Calendar, User, Globe } from 'lucide-react';
import './ArticlePage.css';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/article/${id}`);
        setArticle(res.data);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Article not found or system error.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loader-container"><div className="loader"></div></div>;
  }

  if (error || !article) {
    return (
      <div className="error-state">
        <h2>Article Not Found</h2>
        <p>{error || "We couldn't retrieve the requested story."}</p>
        <Link to="/" className="btn-retry">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="article-page">
      <Link to="/" className="back-link">
        <ArrowLeft size={18} />
        Back to News
      </Link>

      <article className="article-container">
        <header className="article-header">
          <div className="article-meta-top">
            <span className="category-badge">{article.category}</span>
            <span className="region-badge">{article.region}</span>
          </div>
          
          <h1 className="article-title">{article.title}</h1>
          
          <div className="article-meta-bottom">
            <div className="meta-item">
              <User size={16} />
              <span>By {article.author || 'TRAVELTEW Staff'} — TRAVELTEW NEWS</span>
            </div>
            <div className="meta-item">
              <Calendar size={16} />
              <span>{formatDate(article.published_at)}</span>
            </div>
          </div>
        </header>

        <div className="article-image-container">
          <img src={article.image} alt={article.title} />
        </div>

        <div className="article-content">
          <p className="article-description">{article.description}</p>
          
          <div className="article-actions">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-primary"
            >
              Verify Source Integrity
              <ExternalLink size={18} />
            </a>
            
            <button onClick={handleShare} className="btn-secondary">
              <Share2 size={18} />
              {copied ? 'Link Copied!' : 'Share Story'}
            </button>
          </div>
        </div>
      </article>

      <div className="ttn-branding-footer">
        <p>You are viewing this report via <strong>TRAVELTEW — Your #1 Travel News Source</strong>.</p>
      </div>
    </div>
  );
};

export default ArticlePage;
