const getBaseUrl = () => {
  // If we are in production (on the web), we use the production API URL
  // If we are in development (localhost), we use the local API URL
  if (window.location.origin.includes('localhost')) {
    return 'http://localhost:5000/api/news';
  }
  
  // Replace this with your actual production domain (e.g., https://api.yourdomain.com)
  return window.location.origin + '/api/news';
};

export const API_URL = getBaseUrl();
