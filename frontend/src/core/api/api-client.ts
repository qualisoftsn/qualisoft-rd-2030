/**
 * 🛰️ API CLIENT - QUALISOFT ELITE RD 2030
 * RÔLE : Injection dynamique des headers et isolation des sessions.
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

    // 1. Injection Jeton (Fix 401)
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Détermination du Domaine Territorial
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const subdomain = parts[0].toLowerCase();
      const isMaster = ['www', 'app', 'elite', 'api', 'localhost'].includes(subdomain);

      // SOUVERAINETÉ : Si on est sur un tenant, on force son domaine dans le header
      if (!isMaster) {
        config.headers['x-tenant-domain'] = subdomain;
      }

      // 3. Injection du Tenant ID (Fix CRUD)
      // Si c'est un Super Admin, il doit envoyer 'MATRIX' pour agir sur le Kernel
      if (user?.U_Role === "SUPER_ADMIN") {
        config.headers['x-tenant-id'] = 'MATRIX';
      } else if (user?.tenantId) {
        config.headers['x-tenant-id'] = user.tenantId;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;