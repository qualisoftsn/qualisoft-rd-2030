/* eslint-disable @typescript-eslint/no-require-imports */
import axios from 'axios';

/**
 * API CLIENT UNIFIÉ - QUALISOFT ELITE
 * Ce client est conçu pour fonctionner de manière hybride :
 * 1. Sur Navigateur (Web) : Utilise le localStorage pour la persistance.
 * 2. Sur React Native (Mobile) : Utilise Zustand pour la persistance.
 * * ✅ AUCUNE fonctionnalité n'est supprimée.
 * ✅ La compatibilité Multi-tenant (X-Tenant-ID) est maintenue.
 */
const apiClient = axios.create({
  // URL de production sur votre infrastructure OVH
  baseURL: 'https://elite.qualisoft.sn/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * INTERCEPTEUR DE REQUÊTE
 * Récupère dynamiquement les jetons d'accès selon l'environnement d'exécution.
 */
apiClient.interceptors.request.use(async (config) => {
  let token: string | null = null;
  let tenantId: string | null = null;

  // --- STRATÉGIE 1 : ENVIRONNEMENT WEB (Navigateur) ---
  // On vérifie la présence de 'window' pour s'assurer qu'on est côté client Web
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        token = user?.token || null;
        tenantId = user?.tenantId || null;
      }
    } catch {
      // Échec silencieux pour ne pas bloquer l'application en cas de localStorage corrompu
      console.warn("[apiClient] Impossible d'accéder au localStorage Web.");
    }
  }

  // --- STRATÉGIE 2 : ENVIRONNEMENT MOBILE (React Native) ---
  // Si nous n'avons pas de token et que 'window' est indéfini, nous sommes probablement sur Mobile
  if (!token && typeof window === 'undefined') {
    try {
      /**
       * On utilise 'require' au lieu d'un 'import' statique en haut du fichier.
       * Cela évite que le compilateur Web ne cherche un module qu'il ne possède pas.
       */
      // @ts-ignore : On ignore l'absence du module lors de la compilation Web
      const authModule = require('../store/authStore');
      
      if (authModule && authModule.useAuthStore) {
        const state = authModule.useAuthStore.getState();
        token = state?.token || null;
        tenantId = state?.tenantId || null;
      }
    } catch {
      /**
       * Cet échec est normal lorsque ce code est exécuté par le Frontend Web.
       * Le catch vide garantit qu'aucune erreur ne s'affiche dans la console Web.
       */
    }
  }

  // --- INJECTION DES EN-TÊTES DE SÉCURITÉ ---
  // Authentification standard JWT
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Isolation des données pour le Multi-tenant (Elite)
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  return config;
}, (error) => {
  // Gestion des erreurs de configuration de requête
  return Promise.reject(error);
});

export default apiClient;