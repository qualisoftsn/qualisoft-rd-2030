/**
 * CHEMIN ABSOLU : /frontend/src/core/api/api-client.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Client Axios "Blindé" (Force l'injection du Token via LocalStorage).
 * VERSION : 2.1.0 (Fix Authentification Robuste)
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

// 1. Configuration de base avec URL forcée pour la Prod
const apiClient: AxiosInstance = axios.create({
  baseURL: isServer 
    ? 'http://backend:9000/api' // Communication interne Docker
    : 'https://api.qualisoft.sn/api', // URL Publique forcée
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// 2. Intercepteur "Douanier" : Il fouille partout pour trouver le Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    
    // A. D'abord, on regarde dans le State actif (Zustand)
    let token = useAuthStore.getState().token;
    const tenantId = useAuthStore.getState().tenantId;

    // B. [CRITIQUE] Si le State est vide (ex: après F5), on force la lecture du LocalStorage
    if (!token && !isServer) {
      try {
        // On lit le stockage brut de Zustand
        const storageRaw = localStorage.getItem('auth-storage');
        if (storageRaw) {
          const parsed = JSON.parse(storageRaw);
          // On extrait le token manuellement
          token = parsed.state?.token || null;
        }
        
        // Fallback ultime : On regarde si un token traîne ailleurs (Legacy)
        if (!token) {
          token = localStorage.getItem('token');
        }
      } catch (e) {
        console.warn("⚠️ Erreur lecture LocalStorage", e);
      }
    }

    // C. Gestion de l'Impersonation (Le Master Token écrase tout)
    const masterToken = !isServer ? localStorage.getItem('master_token') : null;
    const finalToken = masterToken || token;

    // D. INJECTION DU TOKEN (Si on en a trouvé un)
    if (finalToken && config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    // E. INJECTION DU DOMAINE (Pour le Multi-Tenant sde, senelec, etc.)
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const serviceDomains = ['www', 'app', 'elite', 'api'];
      
      if (parts.length > 2 && !serviceDomains.includes(parts[0])) {
        const domain = parts[0];
        config.headers['x-tenant-domain'] = domain;
        config.headers['X-Tenant-Domain'] = domain; // Doublon sécurité
      }
    }

    // F. Injection de l'ID Tenant si connu
    if (tenantId && config.headers) {
      config.headers['x-tenant-id'] = tenantId;
    }

    return config;
  },
  (error) => {
    console.error(`[API-CLIENT] Erreur Request :`, error);
    return Promise.reject(error);
  }
);

// 3. Intercepteur de Réponse (Gère l'expiration de session)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("⛔ [API] Session invalide ou expirée (401).");
      // Ici, on pourrait forcer un logout si nécessaire, 
      // mais on évite pour ne pas faire de boucle infinie.
    }
    return Promise.reject(error);
  }
);

export default apiClient;