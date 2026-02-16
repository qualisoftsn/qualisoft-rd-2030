/**
 * 🛰️ API CLIENT - QUALISOFT ELITE RD 2030
 * RÔLE : Injection des headers de souveraineté et isolation des contextes territoriaux.
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
    const { token, user } = state;

    // A. Preuve d'identité (Fix 401)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // B. SCELLAGE CRUD (Fix 403 / Autorité Matrix)
    if (config.headers) {
      // Si SUPER_ADMIN, on force 'MATRIX' pour piloter tout le Kernel
      if (user?.U_Role === "SUPER_ADMIN") {
        config.headers['x-tenant-id'] = 'MATRIX';
      } else if (user?.tenantId) {
        config.headers['x-tenant-id'] = user.tenantId;
      }
    }

    // C. Contexte Territorial (Isolation des sous-domaines)
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      if (parts.length > 2 && !['www', 'api', 'app', 'elite', 'localhost'].includes(parts[0])) {
        config.headers['x-tenant-domain'] = parts[0].toLowerCase();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;