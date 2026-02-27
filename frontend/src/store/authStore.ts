/**
 * CHEMIN ABSOLU : /src/store/authStore.ts
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
  assignedProcessId?: string | null;
}

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean; // ✅ Ajouté pour le Layout
  setLogin: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void; // ✅ Ajouté
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      user: null,
      isAuthenticated: false,
      isInitialized: false, // ✅ Initialisé à false

      setLogin: (data) => {
        if (typeof window !== 'undefined') {
          // Note : On utilise 'qualisoft_token' pour matcher ton middleware
          document.cookie = `qualisoft_token=${data.token}; Path=/; Max-Age=86400; SameSite=Strict; Secure`;
        }
        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user,
          isAuthenticated: true 
        });
      },

      setInitialized: (val) => set({ isInitialized: val }),

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('qualisoft-auth-storage');
          sessionStorage.clear();
          document.cookie = "qualisoft_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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
      onRehydrateStorage: () => (state) => {
        // 🛡️ Une fois que le storage est lu, on libère le layout
        if (state) {
          state.setInitialized(true);
          state.isAuthenticated = !!state.token;
        }
      }
    }
  )
);