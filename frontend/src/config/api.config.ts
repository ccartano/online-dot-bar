// API Configuration
export const API_CONFIG = {
  // Use the production URL when building for production
  baseUrl: import.meta.env.PROD 
    ? 'https://theonline.bar' 
    : 'http://localhost:3000',
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseUrl}/api${endpoint}`;
}; 