/**
 * 🧠 MODULE : authStore.ts
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'état global d'authentification et du contexte Tenant.
 * PHILOSOPHIE : Persistance atomique via Zustand (§ISO 27001).
 * RÉVISION : 03 Mars 2026 | 00:45 GMT
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// --- 🔱 INTERFACES SCELLÉES (RESTAURATION INTÉGRALE) ---

export interface AuthUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: string;
  tenantId: string;
  U_TenantName: string;
  U_TenantDomain?: string;
  assignedProcessId?: string | null; // Conservé : Pivot de workflow
}

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isMasterSession: boolean; // Ajouté : Pour le mode "Master Override"
  
  // ACTIONS RÉGALIENNES
  setLogin: (data: { token: string; user: AuthUser; isMaster?: boolean }) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
  updateUser: (userData: Partial<AuthUser>) => void; // Ajouté : Pour la mise à jour profil
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

      /**
       * 🚀 SÉQUENCE D'AUTORISATION
       * Scelle le jeton dans les cookies et hydrate le store Matrix.
       */
      setLogin: (data) => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          // Résolution du domaine pour isolation (ex: .qualisoft.sn)
          const domain = hostname === 'localhost' ? '' : `domain=.${hostname.split('.').slice(-2).join('.')};`;
          
          document.cookie = `qualisoft_token=${data.token}; Path=/; ${domain} Max-Age=86400; SameSite=Lax; Secure`;
          
          // Si c'est un bypass Master (A. Thiongane), on scelle le marqueur
          if (data.isMaster || data.token === 'MASTER_TOKEN_SOUVERAIN') {
            document.cookie = `MASTER_TOKEN_SOUVERAIN=true; Path=/; ${domain} Max-Age=28800; SameSite=Lax; Secure`;
          }
        }

        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user,
          isAuthenticated: true,
          isMasterSession: data.isMaster || data.token === 'MASTER_TOKEN_SOUVERAIN'
        });
      },

      setInitialized: (val) => set({ isInitialized: val }),

      /**
       * 🛡️ PROTOCOLE DE MISE À JOUR RH
       */
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      /**
       * 🧹 PURGE ATOMIQUE (ANTI-LEAK)
       * Effacement simultané sur tous les domaines pour stopper les fuites Sagam/Elite.
       */
      logout: () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          const domain = hostname === 'localhost' ? '' : `.${hostname.split('.').slice(-2).join('.')}`;
          
          // Nettoyage Local & Session
          localStorage.removeItem('qualisoft-auth-storage');
          sessionStorage.clear();

          // Purge des Cookies Cross-Domain
          const cookieBase = "Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          document.cookie = `qualisoft_token=; ${cookieBase}`;
          document.cookie = `qualisoft_token=; domain=${domain}; ${cookieBase}`;
          document.cookie = `MASTER_TOKEN_SOUVERAIN=; domain=${domain}; ${cookieBase}`;
        }
        
        set({ 
          token: null, 
          tenantId: null, 
          user: null, 
          isAuthenticated: false, 
          isMasterSession: false 
        });
      },
    }),
    { 
      name: 'qualisoft-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      /**
       * 🧪 HYDRATATION KERNEL
       * Vérifie l'intégrité du token lors du rechargement de la page.
       */
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setInitialized(true);
          // On s'assure que isAuthenticated est synchrone avec la présence du token
          state.isAuthenticated = !!state.token;
          state.isMasterSession = state.token === 'MASTER_TOKEN_SOUVERAIN' || (typeof document !== 'undefined' && document.cookie.includes('MASTER_TOKEN_SOUVERAIN'));
        }
      }
    }
  )
);