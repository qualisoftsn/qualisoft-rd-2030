/**
 * 🛰️ MODULE : API CLIENT MATRIX (AXIOS)
 * -------------------------------------------------------------------------
 * RÔLE : Intercepteur souverain pour la communication avec le Noyau NestJS.
 * STRATÉGIE : Injection automatique du JWT scellé (qualisoft_token).
 * -------------------------------------------------------------------------
 */

import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Configuration de base de l'instance Axios
const apiClient = axios.create({
  // Utilisation du préfixe défini dans le proxy Next.js ou l'URL directe
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  withCredentials: true, // 🛡️ Crucial : Permet de transmettre les cookies HTTP-Only
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 🛠️ INTERCEPTEUR DE REQUÊTE
 * Rôle : Récupérer le token et l'injecter dans le header Authorization.
 */
apiClient.interceptors.request.use(
  (config) => {
    // 1. Priorité : Récupération du token depuis les cookies (plus fiable pour le Middleware)
    let token = typeof document !== 'undefined' 
      ? document.cookie
          .split('; ')
          .find(row => row.startsWith('qualisoft_token='))
          ?.split('=')[1]
      : null;

    // 2. Fallback : Si le cookie n'est pas lisible (JS), on tente le store Zustand
    if (!token) {
      token = useAuthStore.getState().token;
    }

    // 3. Injection dans les headers si le token existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 🛠️ INTERCEPTEUR DE RÉPONSE
 * Rôle : Gérer les erreurs de sécurité globales (401 / 403).
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔴 CAS : SESSION EXPIREE OU TOKEN INVALIDE (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn("⚠️ [SÉCURITÉ] Session Matrix expirée ou non autorisée.");
      
      // On évite les boucles infinies de redirection
      originalRequest._retry = true;

      // Nettoyage local et redirection forcée vers le login
      if (typeof window !== 'undefined') {
        // Suppression du cookie corrompu
        document.cookie = "qualisoft_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; Secure; SameSite=Lax";
        
        // Nettoyage du store Zustand
        useAuthStore.getState().logout();

        // Expulsion vers la porte d'entrée avec paramètre de contexte
        window.location.href = '/auth/login?session=expired';
      }
    }

    // 🟠 CAS : DROITS INSUFFISANTS (403)
    if (error.response?.status === 403) {
      console.error("🚫 [ACCÈS] Droits insuffisants pour cette opération Matrix.");
    }

    return Promise.reject(error);
  }
);

export default apiClient;