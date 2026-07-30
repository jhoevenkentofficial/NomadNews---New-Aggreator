import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router';
import axios from 'axios';
import { API_URL } from '../config/api';
import { AffiliateWidget } from '../components/AffiliateWidget';
import { ArrowLeft, Clock, User, Share2, CheckCircle2, ExternalLink } from 'lucide-react';
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
        (import.meta.env.VITE_DEBUG_CLIENT === 'true') && console.warn('Error fetching article:', err);
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

  // Detect all internal TTN / TRAVELTEW source variants
  const isTTNSource = (src) => {
    if (!src) return true;
    const s = src.toLowerCase();
    return s.includes('traveltew') || s.includes('ttn news') || s.includes('ttn') || s === 'admin';
  };

  const isExternal = article && !isTTNSource(article.source);
  const safeArticleContent = useMemo(() => sanitizeArticleHtml(article?.content || ''), [article?.content]);

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
        <div className="article-header">
          <div className="article-meta-top">
            <span className="category-badge">{article.category}</span>
            {article.region && <span className="region-badge">{article.region}</span>}
            <div className="reading-time">
              <Clock size={14} />
              <span>{Math.max(1, Math.ceil((article.content?.length || article.description?.length || 0) / 1000))} min read</span>
            </div>
          </div>

          <h1 className="article-title">{article.title}</h1>

          <div className="article-byline-premium">
            <div className="author-info">
              <div className="author-avatar">
                {article.author ? article.author.charAt(0) : <User size={20} />}
              </div>
              <div className="author-details">
                <span className="author-label">Reported by</span>
                <span className="author-name">{article.author || 'TTN Staff Reporter'}</span>
              </div>
            </div>

            <div className="source-info">
              <span className="source-label">Source</span>
              <span className={`source-value ${article.source !== 'TTN News' ? 'external' : ''}`}>
                {article.source}
              </span>
            </div>

            <div className="date-info">
              <span className="date-label">Published</span>
              <span className="date-value">{new Date(article.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {article.source !== 'TTN News' && (
            <div className="republication-banner">
              <div className="repub-dot"></div>
              <span>REPUBLISHED BY TRAVELTEW NEWS</span>
            </div>
          )}
        </div>

        <div className="article-image-container">
          <img src={article.image} alt={article.title} />
        </div>

        <div className="article-content">
          <p className="article-description">{article.description}</p>

          <AffiliateWidget slot="article" title="Useful Travel Tools for This Story" />

          {safeArticleContent && safeArticleContent.trim().length > (article.description || '').length + 200 ? (
            <div className="article-body-wrapper">
              <div className="content-badge-premium">
                <CheckCircle2 size={16} />
                <span>Verified Full Report</span>
              </div>
              <div
                className="article-full-body"
                dangerouslySetInnerHTML={{ __html: safeArticleContent }}
              />
            </div>
          ) : (
            isExternal && (
              <div className="no-content-notice">
                <div className="notice-header">
                  <span className="notice-icon">ℹ️</span>
                  <strong>Aggregation in Progress</strong>
                </div>
                <p>We are currently retrieving the full text for this report. For immediate access, you can verify the original source using the button below.</p>
              </div>
            )
          )}

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
