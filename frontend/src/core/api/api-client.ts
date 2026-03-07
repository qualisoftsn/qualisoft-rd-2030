/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 🛰️ MODULE : API-CLIENT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur Matrix OS.
 * FIX : Routage ABSOLU pour éviter les collisions HTML sur sous-domaines.
 * RÉVISION : 07 Mars 2026 | 04:10 GMT
 * -------------------------------------------------------------------------
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // 🛡️ Si on est sur un sous-domaine, on force l'URL de l'API centrale
    if (hostname.includes('qualisoft.sn') && !hostname.startsWith('api.')) {
      return 'https://api.qualisoft.sn/api';
    }
  }
  return '/api'; 
};

const getDomainContext = () => {
  if (typeof window === 'undefined') return { slug: 'elite' };
  const hostname = window.location.hostname.toLowerCase();
  const parts = hostname.split('.');
  
  if (parts.length < 2 || hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return { slug: 'elite' };
  }
  
  const slug = parts[0];
  const reserved = ['www', 'app', 'matrix', 'admin', 'master', 'qualisoft', 'elite', 'api'];
  return { slug: reserved.includes(slug) ? 'elite' : slug };
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, 
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000 
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { slug } = getDomainContext();
    const auth: any = useAuthStore.getState();

    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    
    config.headers['X-Tenant-Id'] = slug;
    return config;
  }, 
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status } = error.response || {};
    
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      // 🛡️ On vérifie si on est sur la page de login pour éviter les boucles
      const isAuthPage = pathname.includes('/auth/login') || pathname.includes('/login');
      const shouldSkip = originalRequest.headers['X-Skip-Interceptor'] === 'true';

      if (status === 401 && !shouldSkip && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!isAuthPage) {
          try {
            const auth: any = useAuthStore.getState();
            auth.logout(); 
          } catch (e) { /* Store Silent */ }
          // 🛡️ On redirige vers l'URL exacte du dossier (voir middleware ci-dessous)
          window.location.href = '/auth/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;