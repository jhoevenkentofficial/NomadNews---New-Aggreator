import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { AFFILIATE_PLACEMENTS } from '../components/AffiliateWidget';
import './AdminPage.css';

const AdminPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    content: '',
    category: 'Breaking News',
    image: '',
    author: '',
    source: 'TTN News',
    secret: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const categories = [
    'Breaking News', 
    'Airport News', 
    'Popular Destinations', 
    'Major Cities', 
    'Travel News', 
    'Special Reports',
    'Announcements'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_URL}/manual`, formData);
      setStatus({ type: 'success', message: response.data.message });
      setFormData({ 
        title: '', 
        url: '', 
        description: '', 
        content: '',
        category: 'Announcements', 
        image: '', 
        author: '',
        source: 'TTN News',
        secret: formData.secret 
      });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.error || 'Failed to add article' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card">
        <div className="admin-header">
          <h2>TTN News Admin Portal</h2>
          <p>Manually publish articles to the TTN News section</p>
        </div>


        <div className="affiliate-admin-panel">
          <div>
            <span className="affiliate-admin-kicker">Monetization</span>
            <h3>Affiliate Management</h3>
            <p>Sponsored travel placements are enabled for the homepage, article pages, sidebar, and footer.</p>
          </div>
          <div className="affiliate-admin-grid">
            {AFFILIATE_PLACEMENTS.map((placement) => (
              <div key={placement.key} className="affiliate-admin-item">
                <strong>{placement.partner}</strong>
                <span>{placement.label}</span>
                <small>{placement.type.toUpperCase()} · {placement.category}</small>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Admin Secret Key</label>
            <input 
              type="password" 
              name="secret" 
              value={formData.secret} 
              onChange={handleChange} 
              placeholder="Enter your secret admin key"
              required 
            />
          </div>

          <div className="form-divider"></div>

          <div className="form-group">
            <label>Article Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              placeholder="Enter a catchy headline"
              required 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Sub-section (Category)</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Author Name / Credit</label>
              <input 
                type="text" 
                name="author" 
                value={formData.author} 
                onChange={handleChange} 
                placeholder="Name of the writer"
              />
            </div>
            <div className="form-group">
              <label>Original Source</label>
              <input 
                type="text" 
                name="source" 
                value={formData.source} 
                onChange={handleChange} 
                placeholder="e.g. CNN, BBC, Reuters"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL</label>
            <input 
              type="text" 
              name="image" 
              value={formData.image} 
              onChange={handleChange} 
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label>Brief Summary (Description)</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Provide a short summary for the news card"
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Full Article Body (HTML Allowed)</label>
            <textarea 
              name="content" 
              value={formData.content} 
              onChange={handleChange} 
              placeholder="Paste the entire article here. You can use HTML tags for formatting."
              rows="15"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Reference URL (Optional)</label>
            <input 
              type="text" 
              name="url" 
              value={formData.url} 
              onChange={handleChange} 
              placeholder="Link to full story if applicable"
            />
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish to TTN News'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminPage;
