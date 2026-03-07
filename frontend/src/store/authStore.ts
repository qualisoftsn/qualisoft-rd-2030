/**
 * 🧠 MODULE : AUTH-STORE (ELITE-SDE)
 * -------------------------------------------------------------------------
 * RÔLE : État Global & Persistance Multi-Tenant.
 * RÉVISION : 07 Mars 2026 | 17:10 GMT
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
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setLogin: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
}

/**
 * 🛰️ RÉSOLUTION DU WILDCARD DOMAIN
 */
const getCookieDomain = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return '';
  const parts = hostname.split('.');
  return parts.length >= 2 ? `domain=.${parts.slice(-2).join('.')};` : '';
};

// ✅ EXPORT NOMMÉ EXPLICITE
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false,

      setLogin: (data) => {
        if (typeof window !== 'undefined') {
          const domainConfig = getCookieDomain();
          // On scelle le cookie 'access_token' pour le middleware
          document.cookie = `access_token=${data.token}; Path=/; ${domainConfig} Max-Age=86400; SameSite=Lax; Secure`;
        }
        set({ token: data.token, user: data.user, isAuthenticated: true });
      },

      setInitialized: (val) => set({ isInitialized: val }),

      logout: () => {
        if (typeof window !== 'undefined') {
          const domainConfig = getCookieDomain();
          document.cookie = `access_token=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
          document.cookie = `access_token=; ${domainConfig} Path=/; Max-Age=0; SameSite=Lax; Secure`;
          localStorage.removeItem('qualisoft-auth-storage');
        }
        set({ token: null, user: null, isAuthenticated: false, isInitialized: true });
      },
    }),
    { 
      name: 'qualisoft-auth-storage', 
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => { if (state) state.setInitialized(true); }
    }
  )
);