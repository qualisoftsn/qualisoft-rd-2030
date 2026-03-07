/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
// ✅ IMPORT NOMMÉ STRICT
import { useAuthStore } from '@/store/authStore';

const apiClient = axios.create({
  baseURL: 'https://api.qualisoft.sn/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
  timeout: 30000 
});

apiClient.interceptors.request.use((config) => {
  // ✅ ACCÈS HORS-COMPOSANT VIA getState()
  const auth: any = useAuthStore.getState();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const slug = hostname.split('.')[0];
  
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  config.headers['X-Tenant-Id'] = ['www', 'app', 'elite', 'localhost'].includes(slug) ? 'elite' : slug;
  
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config.headers['X-Skip-Interceptor']) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        // ✅ APPEL DE LOGOUT DEPUIS LE STORE
        useAuthStore.getState().logout();
        window.location.href = '/auth/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;