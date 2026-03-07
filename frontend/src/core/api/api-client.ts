/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 🛰️ MODULE : API-CLIENT (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur de communication Matrix OS (Sovereign Engine).
 * FONCTION : Injection d'identité (X-Tenant-Id) & Gestion des ruptures de session.
 * SÉCURITÉ : Isolation stricte HttpOnly & Protection contre les boucles d'expiration.
 * RÉVISION : 07 Mars 2026 | 03:30 GMT
 * -------------------------------------------------------------------------
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

/**
 * 🌍 RÉSOLUTION DU CONTEXTE TERRITORIAL (DOMAINE)
 * Détecte si nous sommes sur un sous-domaine (Tenant) ou sur le Master Node.
 */
const getDomainContext = () => {
  if (typeof window === 'undefined') return { slug: 'elite' };
  
  const hostname = window.location.hostname.toLowerCase();
  const parts = hostname.split('.');
  
  // Cas spécial localhost ou IP : slug = 'elite'
  if (parts.length < 2 || hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return { slug: 'elite' };
  }
  
  // Extraction du premier segment (ex: 'sagam' dans sagam.qualisoft.sn)
  const slug = parts[0];
  const reserved = ['www', 'app', 'matrix', 'admin', 'master', 'qualisoft', 'elite'];
  
  return { 
    slug: reserved.includes(slug) ? 'elite' : slug 
  };
};

/**
 * 🏗️ INSTANCIATION DU KERNEL AXIOS
 */
const apiClient: AxiosInstance = axios.create({
  // Point d'entrée de l'API (Variable d'environnement ou proxy local)
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // 🛡️ VITAL : Autorise l'envoi automatique des cookies HttpOnly ('access_token')
  withCredentials: true, 
  
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Timeout de 30s pour les connexions bas débit (PWA Ready)
  timeout: 30000 
});

/**
 * 🛰️ INTERCEPTEUR DE REQUÊTE : INJECTION D'IDENTITÉ
 * Scelle chaque appel avec le Tenant-Id et le Token en mémoire.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { slug } = getDomainContext();
    const auth: any = useAuthStore.getState();

    // 1. Injection du Jeton en mémoire (si présent) comme second rempart
    if (auth?.token) {
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    
    // 2. ISOLATION TENANT : On informe le backend du nœud territorial actuel
    config.headers['X-Tenant-Id'] = slug;
    
    // 3. TELEMETRY : Horodatage SDE pour monitoring performance
    config.headers['X-SDE-Timestamp'] = new Date().toISOString();
    
    return config;
  }, 
  (error) => Promise.reject(error)
);

/**
 * 🛡️ INTERCEPTEUR DE RÉPONSE : SENTINELLE DE SESSION
 * Gère les ruptures de tunnel (401) et bloque les boucles de redirection.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;
    const { status } = error.response || {};
    
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isAuthPage = pathname.includes('/auth/login');
      
      // 🛑 OPTION : X-Skip-Interceptor
      // Si la requête contient ce flag, on ne déclenche JAMAIS la redirection de session.
      const shouldSkip = originalRequest.headers['X-Skip-Interceptor'] === 'true';

      /**
       * GESTION DE LA RUPTURE 401 (UNAUTHORIZED)
       * Déclenchée si le cookie 'access_token' est absent, expiré ou corrompu.
       */
      if (status === 401 && !shouldSkip && !originalRequest._retry) {
        originalRequest._retry = true;

        // Si on n'est pas déjà sur la page de login, on force l'éjection
        if (!isAuthPage) {
          // 🧹 Purge atomique du store Zustand
          try {
            const auth: any = useAuthStore.getState();
            auth.logout(); 
          } catch (e) {
            console.warn("ÉCHEC PURGE STORE :", e);
          }
          
          // Redirection vers le SAS de connexion avec flag d'expiration
          window.location.href = '/auth/login?session=expired';
        }
      }
      
      /**
       * GESTION 403 (FORBIDDEN)
       * Droits insuffisants pour l'action demandée (Souveraineté RBAC).
       */
      if (status === 403) {
        console.error("🔒 VIOLATION RBAC : Accès refusé par le Kernel.");
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;