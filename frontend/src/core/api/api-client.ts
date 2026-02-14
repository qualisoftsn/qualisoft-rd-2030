/**
 * CHEMIN ABSOLU : /frontend/src/core/api/api-client.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Client Axios souverain avec détection de territoire (Multi-Tenant).
 * VERSION : 2.0.5 (Build Production Ready)
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

const apiClient: AxiosInstance = axios.create({
  // Utilisation de l'URL interne dans Docker pour le SSR, et l'URL publique pour le client
  baseURL: isServer 
    ? 'http://backend:9000/api' 
    : (process.env.NEXT_PUBLIC_API_URL || 'https://api.qualisoft.sn/api'),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 1. Récupération de l'état d'authentification depuis Zustand
    const { token, tenantId } = useAuthStore.getState();
    
    // 2. Gestion du jeton (Priorité au Master Token pour l'impersonation)
    const masterToken = !isServer ? localStorage.getItem('master_token') : null;
    const finalToken = masterToken || token;

    if (finalToken && config.headers) {
      config.headers.Authorization = `Bearer ${finalToken}`;
    }

    // 3. 🛰️ LOGIQUE DE DÉTECTION DU TERRITOIRE (SOUS-DOMAINE)
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      
      // On vérifie si on est sur un sous-domaine organisationnel (ex: sde.qualisoft.sn)
      // On exclut les domaines de service (app, elite, api, www)
      const serviceDomains = ['www', 'app', 'elite', 'api'];
      
      if (parts.length > 2 && !serviceDomains.includes(parts[0])) {
        const domain = parts[0];
        
        // On injecte le domaine dans les headers pour que le Backend sache quel nœud interroger
        config.headers['x-tenant-domain'] = domain;
        config.headers['X-Tenant-Domain'] = domain; // Doublon de sécurité pour certains proxys
      }
    }

    // 4. Injection de l'identifiant technique du Tenant (UUID) si présent
    if (tenantId && config.headers) {
      config.headers['x-tenant-id'] = tenantId;
      config.headers['X-Tenant-ID'] = tenantId;
    }

    return config;
  },
  (error) => {
    // Logging d'erreur réseau pour le debug post-build
    console.error(`[API-CLIENT] Erreur de requête :`, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;