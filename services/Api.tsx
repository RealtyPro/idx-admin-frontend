import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
 baseURL: 'https://demorealestate2.webnapps.net/api/', // Set your base URL here
// baseURL: 'https://demorealestate.test/api/',
});

// Request interceptor to add headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Always set Content-Type for JSON requests
    if (config.headers && typeof config.headers.set === 'function') {
      if (!config.headers.has('Content-Type')) {
        config.headers.set('Content-Type', 'application/json');
      }
    } else if (config.headers && !('Content-Type' in config.headers)) {
      // fallback for older Axios versions or plain object headers
      config.headers['Content-Type'] = 'application/json';
    }

    // Add Authorization header if access_token exists in sessionStorage
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network Error: Please check your internet connection.'));
    }

    const status = error.response.status;
    const message = (error.response.data as any)?.message || 'Unknown error';

    switch (status) {
      case 400:
        console.error('Bad Request:', message);
        break;
      case 401:
        console.error('Unauthorized:', message);
        break;
      case 403:
        console.error('Forbidden:', message);
        break;
      case 404:
        console.error('Not Found:', message);
        break;
      case 500:
        console.error('Internal Server Error:', message);
        break;
      default:
        console.error('Error:', message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
