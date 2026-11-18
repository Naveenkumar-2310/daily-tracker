import axios from 'axios';
import { Platform } from 'react-native';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

/**
 * Shared Axios instance matching Tutor AI client pattern
 */
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error unwrapping
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log in development for transparent debugging
    if (__DEV__) {
      console.warn('API Client Request Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

