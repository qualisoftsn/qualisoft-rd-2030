import axios, { InternalAxiosRequestConfig } from 'axios';
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
    
    // 1. Injection du Jeton Bearer
    if (state.token && config.headers) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }

    // 2. Injection du Tenant ID (Crucial pour Prisma Multi-tenant)
    // On utilise exactement la structure de ton authStore
    if (state.user?.tenantId && config.headers) {
      config.headers['x-tenant-id'] = state.user.tenantId;
    }

    // 3. Contexte de domaine (pour app.qualisoft.sn vs client.qualisoft.sn)
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