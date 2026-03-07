/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 🛰️ MODULE : API-CLIENT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur de communication Matrix OS.
 * FIX : Forçage de l'URL absolue pour briser les collisions de sous-domaines.
 * RÉVISION : 07 Mars 2026 | 04:10 GMT
 * -------------------------------------------------------------------------
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * 🏗️ RÉSOLUTION DE L'URL RACINE (MATRIX-CORE)
 * On s'assure que l'API n'est jamais appelée de manière relative sur un sous-domaine.
 */
const getBaseURL = () => {
  // 1. Priorité à la variable d'environnement (Docker/Vercel)
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  // 2. Logique de détection de production
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si on est sur un sous-domaine client, on pointe vers l'API centrale
    if (hostname.includes('qualisoft.sn') && !hostname.startsWith('api.')) {
      return 'https://api.qualisoft.sn/api';
    }
  }
  
  // 3. Fallback local pour le développement
  return '/api'; 
};

/**
 * 🌍 RÉSOLUTION DU CONTEXTE TERRITORIAL (SLUG)
 */
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
  withCredentials: true, // Crucial pour les cookies HttpOnly 'access_token'
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Indique au serveur que c'est du AJAX
  },
  timeout: 30000 
});

/**
 * 🛰️ INTERCEPTEUR DE REQUÊTE
 */
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

/**
 * 🛡️ INTERCEPTEUR DE RÉPONSE (ANTI-BOUCLE)
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status } = error.response || {};
    
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isAuthPage = pathname.includes('/auth/login');
      const shouldSkip = originalRequest.headers['X-Skip-Interceptor'] === 'true';

      if (status === 401 && !shouldSkip && !originalRequest._retry) {
        originalRequest._retry = true;
        if (!isAuthPage) {
          try {
            const auth: any = useAuthStore.getState();
            auth.logout(); 
          } catch (e) { /* Store Silent */ }
          window.location.href = '/auth/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;