import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import './AdminPage.css';

const AdminPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'Announcements',
    image: '',
    secret: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const categories = ['Announcements', 'Events', 'Highlights', 'Latest TTN', 'Special Reports'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API_URL}/manual`, {
        ...formData,
        source: 'TTN News'
      });
      setStatus({ type: 'success', message: response.data.message });
      setFormData({ title: '', url: '', description: '', category: 'Announcements', image: '', secret: formData.secret });
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

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Admin Secret Key</label>
            <input 
              type="password" 
              name="secret" 
              value={formData.secret} 
              onChange={handleChange} 
              placeholder="Enter your admin token"
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
              <label>Image URL</label>
              <input 
                type="text" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description / Content</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              placeholder="Provide a brief summary or the full article content"
              rows="5"
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
