/**
 * CHEMIN ABSOLU : /frontend/src/core/api/api-client.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Client Axios Centralisé avec Injection Automatique des Headers de Sécurité.
 */

import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

// Détection de l'environnement
const isServer = typeof window === 'undefined';

// 1. Instanciation du Client Axios
const apiClient = axios.create({
  baseURL: isServer 
    ? 'http://backend:9000/api'          // Docker Interne (SSR)
    : 'https://api.qualisoft.sn/api',    // Accès Public (Client)
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000, // Timeout de 15s pour éviter les requêtes fantômes
});

// 2. Intercepteur de Requête (Le "Passe-Partout")
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    
    // A. Récupération de l'état global Zustand
    const state = useAuthStore.getState();
    let token = state.token;
    const user = state.user;

    // B. Fallback : Si Zustand est vide (ex: Hard Refresh), on tente le LocalStorage brut
    if (!token && !isServer) {
      const rawToken = localStorage.getItem('token'); 
      // Note: On préfère le token simple s'il existe, sinon on fouille le storage Zustand
      if (rawToken) {
        token = rawToken;
      }
    }

    // C. INJECTION DU TOKEN (Bearer)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // D. INJECTION DU TENANT ID (CRUCIAL POUR L'ÉCRITURE EN BASE)
    // Si l'utilisateur est connecté, on dit au backend : "Je travaille pour ce Tenant"
    if (user?.tenantId && config.headers) {
      config.headers['x-tenant-id'] = user.tenantId;
    }

    // E. INJECTION DU DOMAINE (Pour le contexte Multi-Site)
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      // Ex: sde.qualisoft.sn -> parts[0] = 'sde'
      const parts = hostname.split('.');
      const forbidden = ['www', 'app', 'elite', 'api', 'localhost'];
      
      if (parts.length > 2 && !forbidden.includes(parts[0])) {
        const domain = parts[0];
        config.headers['x-tenant-domain'] = domain;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Intercepteur de Réponse (Gestion des erreurs globales)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Gestion spécifique des erreurs 401 (Non autorisé)
    if (error.response?.status === 401) {
      console.warn("⛔ Session expirée ou invalide.");
      // Optionnel : Redirection vers login si ce n'est pas déjà géré par le Middleware
      if (!isServer && window.location.pathname !== '/auth/login') {
         // window.location.href = '/auth/login'; // À activer avec précaution
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;