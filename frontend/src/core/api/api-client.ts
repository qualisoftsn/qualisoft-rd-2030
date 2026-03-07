/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 🛰️ MODULE : API-CLIENT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur de communication Matrix OS (Sovereign Engine).
 * FONCTION : Isolation Tenant & Routage Absolu vers le Matrix-Core.
 * FIX : Forçage de l'URL absolue pour éviter les redirections HTML sur subdomains.
 * RÉVISION : 07 Mars 2026 | 03:55 GMT
 * -------------------------------------------------------------------------
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * 🏗️ RÉSOLUTION DE L'URL RACINE
 * Empêche le client de chercher l'API sur le sous-domaine actuel (ex: sagam.qualisoft.sn/api).
 * On force l'appel vers le domaine central api.qualisoft.sn ou l'URL de prod.
 */
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si on est sur un sous-domaine, on pointe vers le domaine racine pour l'API
    if (hostname.includes('qualisoft.sn') && !hostname.startsWith('api.')) {
      return 'https://api.qualisoft.sn/api';
    }
  }
  return '/api'; // Fallback local
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
  
  return { 
    slug: reserved.includes(slug) ? 'elite' : slug 
  };
};

/**
 * 🏗️ INSTANCIATION DU KERNEL AXIOS (ELITE-SDE)
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  
  // 🛡️ VITAL : Permet l'envoi du cookie HttpOnly 'access_token' via les tunnels cross-domain
  withCredentials: true, 
  
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  timeout: 30000 
});

/**
 * 🛰️ INTERCEPTEUR DE REQUÊTE : SCELLAGE TACTIQUE
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { slug } = getDomainContext();
    const auth: any = useAuthStore.getState();

    // 1. Injection du Jeton Matrix (Header de secours)
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    
    // 2. ISOLATION TENANT : On force l'identité du nœud dans chaque flux
    config.headers['X-Tenant-Id'] = slug;
    
    // 3. BYPASS MIDDLEWARE : On identifie la requête comme purement API
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  }, 
  (error) => Promise.reject(error)
);

/**
 * 🛡️ INTERCEPTEUR DE RÉPONSE : SENTINELLE ANTI-BOUCLE
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status } = error.response || {};
    
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isAuthPage = pathname.includes('/auth/login');
      
      // Récupération du flag de skip
      const shouldSkip = originalRequest.headers['X-Skip-Interceptor'] === 'true';

      /**
       * 🚨 GESTION DU 401 (SESSION ROMPUE)
       * Si on reçoit un 401 sur un appel JSON, on ne redirige que si on n'est pas déjà au SAS.
       */
      if (status === 401 && !shouldSkip && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isAuthPage) {
          // Purge souveraine du store
          try {
            const auth: any = useAuthStore.getState();
            auth.logout(); 
          } catch (e) { /* Store Silent */ }
          
          // Redirection navigateur (seule manière de sortir de l'app en cas de crash session)
          window.location.href = '/auth/login?session=expired';
        }
      }
      
      // Log des violations de droits (RBAC)
      if (status === 403) {
        console.error("🔒 MATRIX-SECURITY : Violation des droits d'accès détectée.");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;