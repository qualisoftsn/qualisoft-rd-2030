/* eslint-disable @typescript-eslint/no-unused-vars */
import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

const apiClient = axios.create({
  baseURL: isServer ? 'http://backend:9000/api' : 'https://api.qualisoft.sn/api',
  withCredentials: true,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    const token = state.token;
    const user = state.user;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Utilisation stricte de ta propriété tenantId du store
    if (user?.tenantId && config.headers) {
      config.headers['x-tenant-id'] = user.tenantId;
    }

    // ✅ Restauration de la détection de domaine pour le Multi-site
    if (!isServer && config.headers) {
      const parts = window.location.hostname.split('.');
      if (parts.length > 2 && !['www', 'app', 'elite', 'api', 'localhost'].includes(parts[0])) {
        config.headers['x-tenant-domain'] = parts[0].toLowerCase();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;