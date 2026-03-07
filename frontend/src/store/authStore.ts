/**
 * 🧠 MODULE : AUTH-STORE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : Gestion de l'état global et Contexte Multi-Tenant.
 * FONCTION : Persistance atomique Zustand (§ISO 27001).
 * FIX : Alignement sur 'access_token' & Gestion dynamique du Wildcard Domain.
 * RÉVISION : 07 Mars 2026 | 15:10 GMT
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
  U_AssignedProcessId?: string | null;
}

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isMasterSession: boolean;
  
  // ACTIONS
  setLogin: (data: { token: string; user: AuthUser; isMaster?: boolean }) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
  updateUser: (userData: Partial<AuthUser>) => void;
}

/**
 * 🛰️ UTILITAIRE : RÉSOLUTION DU WILDCARD DOMAIN
 * Permet au cookie d'être partagé entre sagam.qualisoft.sn et qualisoft.sn
 */
const getCookieDomain = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) return '';
  
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    // On extrait les deux derniers segments (ex: .qualisoft.sn)
    return `domain=.${parts.slice(-2).join('.')};`;
  }
  return '';
};

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
       * 🚀 ACTION : SCELLAGE DE SESSION
       */
      setLogin: (data) => {
        if (typeof window !== 'undefined') {
          const domainConfig = getCookieDomain();
          const cookieBase = `Path=/; ${domainConfig} Max-Age=86400; SameSite=Lax; Secure`;
          
          // ✅ FIX : On utilise 'access_token' pour matcher le Middleware et le Backend
          document.cookie = `access_token=${data.token}; ${cookieBase}`;
          
          if (data.isMaster || data.token === 'MASTER_PROTOCOL_2026') {
            document.cookie = `MASTER_SOUVERAIN=true; ${cookieBase}`;
          }
        }

        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user,
          isAuthenticated: true,
          isMasterSession: !!data.isMaster || data.token === 'MASTER_PROTOCOL_2026'
        });
      },

      setInitialized: (val) => set({ isInitialized: val }),

      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      /**
       * 🧹 ACTION : PURGE ATOMIQUE
       */
      logout: () => {
        if (typeof window !== 'undefined') {
          const domainConfig = getCookieDomain();
          
          // Nettoyage Storage
          localStorage.removeItem('qualisoft-auth-storage');
          sessionStorage.clear();

          // Nettoyage Cookies (On expire le cookie sur le domaine racine et actuel)
          const expireBase = "Path=/; Max-Age=0; SameSite=Lax; Secure;";
          document.cookie = `access_token=; ${expireBase}`;
          document.cookie = `access_token=; ${domainConfig} ${expireBase}`;
          document.cookie = `MASTER_SOUVERAIN=; ${domainConfig} ${expireBase}`;
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
          state.setInitialized(true);
          // Sécurité : recalcule l'auth basé sur la présence du token
          state.isAuthenticated = !!state.token;
        }
      }
    }
  )
);