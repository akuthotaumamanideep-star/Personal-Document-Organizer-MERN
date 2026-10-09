import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Add auth token to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('docvault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if expired
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        localStorage.removeItem('docvault_token');
        localStorage.removeItem('docvault_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
