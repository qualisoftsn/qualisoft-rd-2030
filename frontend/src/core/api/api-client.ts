/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : api-client.ts
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur souverain Matrix OS.
 * FONCTION : Injection JWT + X-Tenant-Id + Gestion des ruptures 401/403.
 * RÉVISION : 02 Mars 2026 | 23:30 GMT
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const getDomainContext = () => {
  if (typeof window === 'undefined') return { root: '', slug: 'elite' };
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const root = hostname === 'localhost' ? 'localhost' : `.${parts.slice(-2).join('.')}`;
  const slug = parts.length >= 3 ? parts[0] : 'elite';
  return { root, slug };
};

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { slug } = getDomainContext();
  let token = typeof document !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('qualisoft_token='))?.split('=')[1]
    : null;

  if (!token) {
    try { token = useAuthStore.getState().token; } catch (e) { /* Store non-initié */ }
  }

  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  // 🛡️ ISOLATION TENANT : On informe le backend du slug actuel (sagam, sde, etc.)
  config.headers['X-Tenant-Id'] = slug;
  
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!path.includes('/auth/login')) {
          const { root } = getDomainContext();
          // 🧹 PURGE TOTALE
          document.cookie = `qualisoft_token=; path=/; domain=${root}; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
          document.cookie = `qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
          useAuthStore.getState().logout();
          window.location.href = '/auth/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;