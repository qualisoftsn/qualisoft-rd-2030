/**
 * 🧠 MODULE : authStore.ts
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'état global d'authentification et du contexte Tenant.
 * PHILOSOPHIE : Persistance atomique via Zustand (§ISO 27001).
 * RÉVISION : 03 Mars 2026 | 18:05 GMT
 * -------------------------------------------------------------------------
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AuthUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: string;
  tenantId: string;
  U_TenantName: string;
  U_TenantDomain?: string;
  U_AssignedProcessId?: string | null; // ✅ Correction du nommage physique
}

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isMasterSession: boolean;
  
  setLogin: (data: { token: string; user: AuthUser; isMaster?: boolean }) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
  updateUser: (userData: Partial<AuthUser>) => void;
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
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
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
        
        set({ 
          token: null, 
          tenantId: null, 
          user: null, 
          isAuthenticated: false, 
          isMasterSession: false,
          isInitialized: true
        });
      },
    }),
    { 
      name: 'qualisoft-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // On s'assure que l'initialisation est marquée quoi qu'il arrive
          state.setInitialized(true);
          state.isAuthenticated = !!state.token;
        }
      }
    }
  )
);