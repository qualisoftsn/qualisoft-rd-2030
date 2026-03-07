/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : API-CLIENT (ELITE-SDE)
 * FIX : Routage ABSOLU pour éviter les collisions HTML sur sous-domaines.
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // 🛡️ Sur sous-domaine, on force l'URL du backend central
    if (hostname.includes('qualisoft.sn') && !hostname.startsWith('api.')) {
      return 'https://api.qualisoft.sn/api';
    }
  }
  return '/api'; 
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 30000 
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const auth: any = useAuthStore.getState();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const slug = hostname.split('.')[0];
  
  if (auth?.token) config.headers.Authorization = `Bearer ${auth.token}`;
  
  // On informe le backend du tenant actuel
  config.headers['X-Tenant-Id'] = ['www', 'app', 'qualisoft', 'localhost'].includes(slug) ? 'elite' : slug;
  
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest.headers['X-Skip-Interceptor']) {
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
        const auth: any = useAuthStore.getState();
        auth.logout();
        window.location.href = '/auth/login?session=expired';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;