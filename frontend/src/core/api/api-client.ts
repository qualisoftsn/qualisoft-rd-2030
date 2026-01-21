/* eslint-disable @typescript-eslint/no-require-imports */
import axios from 'axios';

/**
 * API CLIENT UNIFIÉ - QUALISOFT ELITE
 * Compatible Web (localStorage) et Mobile (Zustand)
 */
const apiClient = axios.create({
  baseURL: 'https://elite.qualisoft.sn/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  let token: string | null = null;
  let tenantId: string | null = null;

  // 1. STRATÉGIE WEB : On utilise le localStorage classique
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      token = user?.token || null;
      tenantId = user?.tenantId || null;
    } catch {
      console.warn("Échec lecture localStorage");
    }
  }

  // 2. STRATÉGIE MOBILE : Importation dynamique pour éviter l'erreur de module introuvable
  // On ne tente cet import que si nous sommes en environnement mobile (pas de window)
  if (!token && typeof window === 'undefined') {
    try {
      //// @ts-expect-error - On ignore l'erreur car le module n'existe que côté mobile
      const { useAuthStore } = require('../store/authStore');
      const state = useAuthStore.getState();
      token = state?.token || null;
      tenantId = state?.tenantId || null;
    } catch {
      // Échec silencieux si le fichier n'est pas là (cas du frontend web)
    }
  }

  // 3. INJECTION DES HEADERS
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;