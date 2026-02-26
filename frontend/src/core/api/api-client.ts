import { authManager } from '@/app/auth/auth-manager';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true, // ✅ Envoie les cookies avec chaque requête
});

// ✅ AJOUT DU TOKEN DANS LES EN-TÊTES
apiClient.interceptors.request.use((config) => {
  const token = authManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ GESTION TRANSPARENTE DES 401 (TOKEN EXPIRÉ)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await authManager.silentRefresh();
        originalRequest.headers.Authorization = `Bearer ${authManager.getToken()}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        authManager.clear();
        window.location.href = '/login?session=expired';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;