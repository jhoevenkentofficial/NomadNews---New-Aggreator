const getBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_URL;

  if (configuredUrl) {
    const cleanUrl = configuredUrl.replace(/\/+$/, '');
    return cleanUrl.endsWith('/api/news') ? cleanUrl : `${cleanUrl}/api/news`;
  }

  if (typeof window !== 'undefined') {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://127.0.0.1:5000/api/news';
    }
  }

  return '/api/php';
};

export const API_URL = getBaseUrl();
