const getBaseUrl = () => {
  // If we have a VITE_API_URL set in environment variables (Netlify/Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL + '/api/news';
  }

  // Fallback for local development
  if (window.location.origin.includes('localhost')) {
    return 'http://localhost:5000/api/news';
  }
  
  // Default to relative path for unified hosting (Vercel)
  const url = '/api/news';
  console.log('API_URL initialized as:', url);
  if (typeof window !== 'undefined') {
    window.API_DEBUG = { url, origin: window.location.origin };
  }
  return url;
};

export const API_URL = getBaseUrl();
