/**
 * 🧠 MODULE : authStore.ts
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'état global d'authentification Matrix.
 * RÉPARATION : Stabilisation de l'hydratation pour elite.qualisoft.sn.
 * RÉVISION : 03 Mars 2026 | 18:10 GMT
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types/elite-sde';

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isMasterSession: boolean;
  
  setLogin: (data: { token: string; user: User; isMaster?: boolean }) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      tenantId: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      isMasterSession: false,

      setLogin: (data) => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          // ✅ FIX : On extrait le domaine racine pour que le cookie soit valide partout (*.qualisoft.sn)
          const domainParts = hostname.split('.');
          const baseDomain = domainParts.length >= 2 ? `.${domainParts.slice(-2).join('.')}` : hostname;
          const domainConfig = hostname === 'localhost' ? '' : `domain=${baseDomain};`;
          
          document.cookie = `qualisoft_token=${data.token}; Path=/; ${domainConfig} Max-Age=86400; SameSite=Lax; Secure`;
          
          if (data.isMaster || data.token === 'MASTER_TOKEN_SOUVERAIN') {
            document.cookie = `MASTER_TOKEN_SOUVERAIN=true; Path=/; ${domainConfig} Max-Age=28800; SameSite=Lax; Secure`;
          }
        }

        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user,
          isAuthenticated: true,
          isMasterSession: !!data.isMaster || data.token === 'MASTER_TOKEN_SOUVERAIN'
        });
      },

      setInitialized: (val) => set({ isInitialized: val }),

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) set({ user: { ...currentUser, ...userData } });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const domainParts = hostname.split('.');
          const baseDomain = domainParts.length >= 2 ? `.${domainParts.slice(-2).join('.')}` : hostname;
          
          localStorage.removeItem('qualisoft-auth-storage');
          sessionStorage.clear();

          const cookieBase = "Path=/; Max-Age=0; SameSite=Lax; Secure;";
          document.cookie = `qualisoft_token=; ${cookieBase}`;
          document.cookie = `qualisoft_token=; domain=${baseDomain}; ${cookieBase}`;
          document.cookie = `MASTER_TOKEN_SOUVERAIN=; domain=${baseDomain}; ${cookieBase}`;
        }
        
        set({ token: null, tenantId: null, user: null, isAuthenticated: false, isMasterSession: false });
      },
    }),
    { 
      name: 'qualisoft-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      /**
       * 🧪 HYDRATATION CRITIQUE
       * Force la synchronisation immédiate de l'auth avec le localStorage.
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          // On marque l'initialisation comme terminée
          state.isInitialized = true;
          // ✅ IMPORTANT : On synchronise isAuthenticated AVANT le premier rendu du layout
          if (state.token) {
            state.isAuthenticated = true;
          }
        }
      }
    }
  )
);