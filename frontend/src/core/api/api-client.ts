/**
 * 🛰️ API CLIENT - QUALISOFT ELITE RD 2030
 * RÔLE : Injection dynamique des headers Authorization et TenantID.
 */

import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

const apiClient = axios.create({
  baseURL: isServer ? 'http://backend:9000/api' : 'https://api.qualisoft.sn/api',
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = useAuthStore.getState();
    const token = state.token;
    const user = state.user;

    // A. Injection du Jeton Bearer (Fix 401)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // B. Injection du Tenant ID (Souveraineté Prisma)
    if (user?.tenantId && config.headers) {
      config.headers['x-tenant-id'] = user.tenantId;
    }

    // C. Injection du Sous-domaine (Contexte Territorial)
    if (!isServer && config.headers) {
      const parts = window.location.hostname.split('.');
      // Respect strict de tes MASTER_DOMAINS
      if (parts.length > 2 && !['www', 'api', 'app', 'elite', 'localhost'].includes(parts[0])) {
        config.headers['x-tenant-domain'] = parts[0].toLowerCase();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;