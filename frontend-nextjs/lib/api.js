import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      import('./store.js').then((module) => {
        module.useAuthStore.getState().logout();
      });
      // Also clear cookies if possible, though logout state usually handles UI
      if (typeof window !== 'undefined') {
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    throw new Error(message);
  }
);

export default api;
