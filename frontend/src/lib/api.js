import axios from 'axios';
import { useAuthStore } from './store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Interceptor to attach JWT token to Authorization header for cross-origin requests
api.interceptors.request.use(
  (config) => {
    const user = useAuthStore.getState().user;
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    throw new Error(message);
  }
);

export default api;
