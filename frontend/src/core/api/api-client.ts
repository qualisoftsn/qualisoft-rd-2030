/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * 🛰️ MODULE : api-client.ts (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur souverain Matrix OS.
 * FONCTION : Injection X-Tenant-Id + Gestion des ruptures 401/403.
 * FIX : Suppression de la lecture document.cookie (Incompatible HttpOnly).
 * Le navigateur gère désormais le jeton automatiquement grâce à withCredentials.
 * RÉVISION : 04 Mars 2026 | 22:20 GMT
 * -------------------------------------------------------------------------
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

const getDomainContext = () => {
  if (typeof window === 'undefined') return { root: '', slug: 'elite' };
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  const root = hostname === 'localhost' ? 'localhost' : `.${parts.slice(-2).join('.')}`;
  const slug = parts.length >= 3 ? parts[0] : 'elite';
  return { root, slug };
};

const apiClient = axios.create({
  // ⚠️ ASSUREZ-VOUS QUE NEXT_PUBLIC_API_URL POINTE BIEN VERS https://api.qualisoft.sn/api EN PROD
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  
  // 🛡️ VITAL : C'est cette ligne qui force le navigateur à envoyer le cookie HttpOnly !
  withCredentials: true, 
  
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const { slug } = getDomainContext();
  
  // 🛡️ On récupère le token en mémoire (Zustand) comme filet de sécurité
  let token = null;
  try { token = (useAuthStore.getState() as any).token; } catch (e) { /* Store non-initié */ }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 🛡️ ISOLATION TENANT : On informe le backend du slug actuel (sagam, sde, etc.)
  config.headers['X-Tenant-Id'] = slug;
  
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si l'API renvoie un 401 (Non Autorisé), le cookie est invalide ou expiré
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        if (!path.includes('/auth/login')) {
          
          // 🧹 Purge uniquement de l'état Frontend (Zustand)
          try { (useAuthStore.getState() as any).logout(); } catch (e) {}
          
          window.location.href = '/auth/login?session=expired';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;