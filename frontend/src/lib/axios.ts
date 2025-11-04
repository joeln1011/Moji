import { useAuthStore } from '@/stores/useAuthStore';
import axios from 'axios';

const api = axios.create({
  baseURL:
    import.meta.env.MODE === 'development'
      ? 'http://localhost:5001/api'
      : '/api',
  withCredentials: true,
});

// Add access token to headers
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// auto call refresh api when access token expires
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // apis no need to refresh
    const noRefreshUrls = ['/auth/signin', '/auth/signup', '/auth/refresh'];
    if (noRefreshUrls.includes(originalRequest.url)) {
      return Promise.reject(error);
    }
    originalRequest._retryCount = originalRequest._retryCount || 0;
    // try refreshing token up to 4 times
    if (error.response?.status === 403 && originalRequest._retryCount < 4) {
      originalRequest._retryCount += 1;
      try {
        const res = await api.post('/auth/refresh', { withCredentials: true });
        const newAccessToken = res.data.accessToken;
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
