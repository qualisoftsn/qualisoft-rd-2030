/**
 * CHEMIN ABSOLU : /src/store/authStore.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Store souverain Zustand (Zéro Next-Auth).
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 👤 AUTH USER : Architecture Elite
 */
export interface AuthUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: string;
  tenantId: string;
  U_TenantName: string;
  U_TenantDomain?: string;
  assignedProcessId?: string | null;
}

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setLogin: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      user: null,
      isAuthenticated: false,

      /**
       * 🔑 SCELLAGE DE SESSION
       */
      setLogin: (data) => {
        // En plus du store, on scelle le cookie pour le Middleware Next.js 15
        if (typeof window !== 'undefined') {
          document.cookie = `access_token=${data.token}; Path=/; Max-Age=86400; SameSite=Strict; Secure`;
        }
        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user,
          isAuthenticated: true 
        });
      },

      /**
       * 🛡️ PROTOCOLE DE DÉCONNEXION
       */
      logout: () => {
        if (typeof window !== 'undefined') {
          // Nettoyage des traces locales
          localStorage.removeItem('qualisoft-auth-storage');
          sessionStorage.clear();
          
          // Destruction du cookie
          document.cookie = "access_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
        
        set({ 
          token: null, 
          tenantId: null, 
          user: null,
          isAuthenticated: false
        });
      },
    }),
    { 
      name: 'qualisoft-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      // Empêche les erreurs d'hydratation entre Server et Client
      onRehydrateStorage: () => (state) => {
        if (state) {
          // On s'assure que isAuthenticated est synchro avec la présence du token
          state.isAuthenticated = !!state.token;
        }
      }
    }
  )
);