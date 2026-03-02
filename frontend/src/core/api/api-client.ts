/* eslint-disable @typescript-eslint/no-unused-vars */
//* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛰️ MODULE : API CLIENT MATRIX (AXIOS)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur souverain pour la communication avec le Noyau NestJS.
 * STRATÉGIE : Injection JWT & Gestion stricte des sous-domaines (SDE).
 * FIX CRITIQUE : Purge dynamique des cookies cross-domain pour stopper 
 * les boucles de redirection 401 sur les tenants.
 * -------------------------------------------------------------------------
 * DATE : 02 Mars 2026 | 00:05 GMT
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// --- UTILITAIRE SOUVERAIN : RÉSOLUTION DE DOMAINE ---
// Permet de cibler ".qualisoft.sn" peu importe le sous-domaine actuel (app, sagam, etc.)
const getRootDomain = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return hostname;
  // Extrait "qualisoft.sn" de "sagam.qualisoft.sn"
  const parts = hostname.split('.');
  return `.${parts.slice(-2).join('.')}`; 
};

// --- CONFIGURATION DU NOYAU AXIOS ---
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true, // 🛡️ Autorise la transmission des cookies cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 🛠️ INTERCEPTEUR DE REQUÊTE (OUTGOING)
 * Rôle : Assurer que chaque appel vers le backend possède son laissez-passer (JWT).
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Lecture prioritaire du cookie (si non-HttpOnly)
    let token = typeof document !== 'undefined' 
      ? document.cookie
          .split('; ')
          .find(row => row.startsWith('qualisoft_token='))
          ?.split('=')[1]
      : null;

    // 2. Fallback robuste : Lecture directe dans le store Zustand
    if (!token) {
      try {
        token = useAuthStore.getState().token;
      } catch (e) {
        console.warn("API Client : Le store Auth n'est pas encore initialisé.");
      }
    }

    // 3. Scellage de l'en-tête
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * 🛠️ INTERCEPTEUR DE RÉPONSE (INCOMING)
 * Rôle : Gardien de sécurité. Intercepte les rejets du backend avant l'UI.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔴 CAS 1 : SESSION EXPIRÉE / TOKEN REJETÉ (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Verrou anti-boucle infinie

      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;

        // Si on n'est PAS déjà sur la page de login, on déclenche le protocole d'éjection
        if (!currentPath.includes('/auth/login')) {
          console.warn("⚠️ [SÉCURITÉ] Session Matrix altérée. Exécution du protocole de purge.");
          
          const rootDomain = getRootDomain();

          // 🧹 Purge TOTALE du cookie sur TOUS les sous-domaines possibles
          document.cookie = `qualisoft_token=; path=/; domain=${rootDomain}; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
          document.cookie = `qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`; // Par sécurité sur le domaine exact

          // 🧹 Purge du store Zustand
          useAuthStore.getState().logout();

          // 🚀 Éjection (Rechargement dur pour vider la mémoire de l'app)
          window.location.href = '/auth/login?session=expired';
        }
      }
    }

    // 🟠 CAS 2 : DROITS INSUFFISANTS (403)
    if (error.response?.status === 403) {
      console.error("🚫 [ACCÈS SDE] Autorité insuffisante pour cette transaction sur ce Nœud.");
      // Laisse le composant UI afficher le toast d'erreur via le Promise.reject
    }

    return Promise.reject(error);
  }
);

export default apiClient;