/**
 * 🛰️ KERNEL DE COMMUNICATION - QUALISOFT ELITE RD 2030
 * RÔLE : Client Axios Centralisé. Zéro dépendance fantôme.
 */

import axios, { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

const isServer = typeof window === 'undefined';

const apiClient = axios.create({
  baseURL: isServer 
    ? 'http://backend:9000/api' 
    : 'https://api.qualisoft.sn/api',
  withCredentials: true,
  headers: { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Récupération de l'état (On utilise uniquement ce qui existe : token et user)
    const state = useAuthStore.getState();
    const token = state.token || (!isServer ? localStorage.getItem('token') : null);
    const user = state.user;

    // 2. Injection Token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 3. Injection Tenant ID (Uniquement si l'utilisateur est présent dans le store)
    if (user?.tenantId && config.headers) {
      config.headers['x-tenant-id'] = user.tenantId;
    }

    // 4. Contexte de domaine (Client-side uniquement)
    if (!isServer && config.headers) {
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      const systemReserved = ['www', 'app', 'elite', 'api', 'localhost'];
      
      if (parts.length > 2 && !systemReserved.includes(parts[0])) {
        config.headers['x-tenant-domain'] = parts[0].toLowerCase();
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      console.warn("⛔ Session révoquée.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;