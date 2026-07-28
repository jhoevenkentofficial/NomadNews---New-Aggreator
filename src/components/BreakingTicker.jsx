import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../config/api';
import './BreakingTicker.css';

const BreakingTicker = () => {
    const [trending, setTrending] = useState([]);

    useEffect(() => {
        fetch(`${API_URL}/trending`)
            .then(res => {
                if (!res.ok) throw new Error(`Ticker request failed: ${res.status}`);
                return res.json();
            })
            .then(data => setTrending(data.articles || []))
            .catch(err => console.error('Ticker error:', err));
    }, []);

    const formatCategory = (slug) => {
        if (!slug) return '';
        return slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (trending.length === 0) return null;

    return (
        <div className="breaking-ticker">
            <div className="ticker-container">
                <div className="ticker-label">
                    <span className="live-dot"></span>
                    Trending Now
                </div>
                <div className="ticker-content">
                    <div className="ticker-scroll">
                        {trending.concat(trending).map((item, index) => (
                            <Link key={index} to={`/article/${item.id}`} className="ticker-item">
                                <span className="ticker-category">{formatCategory(item.category)}:</span>
                                {item.title}
                                <span className="ticker-separator">/</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreakingTicker;
