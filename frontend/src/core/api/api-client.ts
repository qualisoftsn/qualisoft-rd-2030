/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 🛰️ MODULE : API-CLIENT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur souverain Matrix OS.
 * FONCTION : Routage ABSOLU & Isolation Multi-Tenant (X-Tenant-Id).
 * FIX : Élimination des redirections HTML sur sous-domaines territoriaux.
 * RÉVISION : 07 Mars 2026 | 14:50 GMT
 * -------------------------------------------------------------------------
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * 🏗️ RÉSOLUTION DE L'URL RACINE (MATRIX-CORE)
 * Force l'appel vers api.qualisoft.sn pour éviter que le sous-domaine
 * n'intercepte l'appel comme une route interne.
 */
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Si nous sommes sur un nœud client (ex: sagam), on vise le cœur central.
    if (hostname.includes('qualisoft.sn') && !hostname.startsWith('api.')) {
      return 'https://api.qualisoft.sn/api';
    }
  }
  return '/api'; // Fallback Localhost
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  
  // 🛡️ VITAL : Autorise l'envoi des cookies HttpOnly ('access_token') cross-domain.
  withCredentials: true, 
  
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  
  timeout: 30000 
});

/**
 * 🛰️ INTERCEPTEUR DE REQUÊTE : SCELLAGE TACTIQUE
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const auth: any = useAuthStore.getState();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    const parts = hostname.split('.');
    
    // 🛡️ RÉSOLUTION DU SLUG TENANT
    const slug = parts[0];
    const isMasterNode = ['www', 'app', 'matrix', 'qualisoft', 'localhost'].includes(slug);
    
    // 1. Injection du Jeton Matrix (Header de secours)
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    
    // 2. ISOLATION TENANT : On force l'identité du nœud dans chaque flux
    config.headers['X-Tenant-Id'] = isMasterNode ? 'elite' : slug;
    
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
      // On évite de boucler si on est déjà sur la passerelle d'auth
      const isAuthPage = pathname.includes('/auth/login');
      
      // Récupération du flag de skip pour les accès publics (§9.1.2)
      const shouldSkip = originalRequest.headers['X-Skip-Interceptor'] === 'true';

      if (status === 401 && !shouldSkip && !originalRequest._retry) {
        originalRequest._retry = true;

        if (!isAuthPage) {
          // Purge souveraine du store frontend
          try {
            const auth: any = useAuthStore.getState();
            auth.logout(); 
          } catch (e) { /* Store Silencieux */ }
          
          // Redirection vers l'URL physique réelle (dossier /auth)
          window.location.href = '/auth/login?session=expired';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;