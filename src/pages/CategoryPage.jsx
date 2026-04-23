import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import WireDashboard from '../components/WireDashboard';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/category/${encodeURIComponent(categoryName)}?limit=60`);
        setArticles(res.data.articles);
      } catch (err) {
        console.error('Error fetching category news:', err);
        setError(`Unable to load news for ${categoryName}.`);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryName]);

  const displayTitle = (categoryName || '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const majorCitiesList = [
    'Paris', 'London', 'Bangkok', 'Dubai', 'Singapore', 'New York City', 'Istanbul', 'Tokyo', 'Kuala Lumpur', 'Hong Kong',
    'Rome', 'Barcelona', 'Amsterdam', 'Madrid', 'Berlin', 'Vienna', 'Prague', 'Budapest', 'Lisbon', 'Athens', 'Milan',
    'Florence', 'Venice', 'Munich', 'Copenhagen', 'Stockholm', 'Dublin', 'Edinburgh', 'Brussels', 'Zurich', 'Geneva',
    'Oslo', 'Helsinki', 'Reykjavik', 'Moscow', 'St. Petersburg', 'Warsaw', 'Krakow', 'Tallinn', 'Riga', 'Beijing',
    'Shanghai', 'Seoul', 'Osaka', 'Kyoto', 'Taipei', 'Hanoi', 'Ho Chi Minh City', 'Bali (Denpasar)', 'Jakarta', 'Phuket',
    'Chiang Mai', 'Manila', 'Cebu', 'Phnom Penh', 'Siem Reap', 'Yangon', 'Colombo', 'Male', 'Kathmandu', 'Sydney',
    'Melbourne', 'Brisbane', 'Auckland', 'Queenstown', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami', 'Orlando',
    'Chicago', 'Toronto', 'Vancouver', 'Montreal', 'Mexico City', 'Cancun', 'Havana', 'San Jose (Costa Rica)', 'Panama City', 'Lima',
    'Cusco', 'Rio de Janeiro', 'Sao Paulo', 'Buenos Aires', 'Santiago', 'Bogota', 'Cartagena', 'Cape Town', 'Johannesburg',
    'Marrakech', 'Cairo', 'Luxor', 'Nairobi', 'Zanzibar City', 'Addis Ababa', 'Tel Aviv', 'Jerusalem', 'Doha', 'Abu Dhabi', 'Mecca'
  ];

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
      {categoryName === 'major-cities' && (
        <div className="city-explorer">
          <h3>Featured Travel Hubs</h3>
          <p className="city-subtitle">Browse the world's most sought-after destinations from our primary source network.</p>
          <div className="city-grid">
            {majorCitiesList.map(city => (
              <a 
                key={city} 
                href={`/search?q=${encodeURIComponent(city)}`}
                className="city-chip"
              >
                {city}
              </a>
            ))}
          </div>
          <div className="city-divider"></div>
        </div>
      )}

      <WireDashboard news={articles} title={displayTitle} />
    </div>
  );
};

export default CategoryPage;
