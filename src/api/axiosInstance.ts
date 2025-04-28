// src/api/axiosInstance.ts
import axios from 'axios';

// Base URL for your Django backend API
// Use environment variable for production, fallback for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Add the JWT token to the Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Or get from your state management
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Optional): Handle token expiration or other global errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Example: Handle 401 Unauthorized (e.g., token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Option 1: Try to refresh the token (if your backend supports it)
      // try {
      //   const refreshToken = localStorage.getItem('refreshToken');
      //   const response = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh: refreshToken });
      //   const { access } = response.data;
      //   localStorage.setItem('accessToken', access);
      //   originalRequest.headers.Authorization = `Bearer ${access}`;
      //   return axiosInstance(originalRequest); // Retry original request with new token
      // } catch (refreshError) {
      //   console.error('Token refresh failed:', refreshError);
      //   // Logout user if refresh fails
      //   localStorage.removeItem('accessToken');
      //   localStorage.removeItem('refreshToken');
      //   window.location.href = '/login'; // Redirect to login
      //   return Promise.reject(refreshError);
      // }

      // Option 2: Simple redirect to login on 401
      console.error('Authentication Error:', error.response);
      localStorage.removeItem('accessToken'); // Clear invalid token
      localStorage.removeItem('refreshToken');
      // Consider using React Router's navigation for cleaner redirects within the app
      if (window.location.pathname !== '/login') {
         window.location.href = '/login';
      }
    }

    // Handle other errors globally if needed
    console.error('API Error:', error.response || error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;