/**
 * 🛰️ API CLIENT - QUALISOFT ELITE RD 2030
 * RÔLE : Injection dynamique des headers de souveraineté.
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

    // A. Jeton d'autorité
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // B. Fix CRUD Matrix (L'ancrage souverain)
    if (config.headers) {
      // Pour que le CRUD marche en Master, on force 'MATRIX'
      if (user?.U_Role === "SUPER_ADMIN") {
        config.headers['x-tenant-id'] = 'MATRIX';
      } else if (user?.tenantId) {
        config.headers['x-tenant-id'] = user.tenantId;
      }
    }

    // C. Contexte Territorial (Subdomain)
    if (!isServer && config.headers) {
      const parts = window.location.hostname.split('.');
      if (parts.length > 2 && !['www', 'app', 'elite', 'api', 'localhost'].includes(parts[0])) {
        config.headers['x-tenant-domain'] = parts[0].toLowerCase();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;