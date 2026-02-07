import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// ============================================================================
// TYPES - ARCHITECTURE ELITE MS (STRICT)
// ============================================================================

interface UserState {
  U_Id: string | null;
  U_Email: string | null;
  U_Role: 'SUPER_ADMIN' | 'ADMIN' | 'USER' | 'PILOTE' | 'COPILOTE' | 'AUDITEUR' | 'HSE' | 'SAFETY_OFFICER' | null;
  U_FirstName: string | null;
  U_LastName: string | null;
  tenantId: string | null;
  tenantName: string | null;
  tenantDomain: string | null;
  token: string | null;
  isLoggedIn: boolean;
}

interface AuthActions {
  setLogin: (userData: Partial<UserState>) => void;
  setLogout: () => void;
  logout: () => void; // Alias requis par apiClient.ts
  updateToken: (newToken: string) => void;
}

// ============================================================================
// STORE D'AUTHENTIFICATION (VERSION PWA)
// ============================================================================

export const useAuthStore = create<UserState & AuthActions>()(
  persist(
    (set) => ({
      // --- État Initial ---
      U_Id: null,
      U_Email: null,
      U_Role: null,
      U_FirstName: null,
      U_LastName: null,
      tenantId: null,
      tenantName: null,
      tenantDomain: null,
      token: null,
      isLoggedIn: false,

      // --- Actions ---
      setLogin: (userData) => set((state) => ({ 
        ...state, 
        ...userData, 
        isLoggedIn: true 
      })),

      updateToken: (newToken) => set({ token: newToken }),

      setLogout: () => set({ 
        U_Id: null, 
        U_Email: null, 
        U_Role: null, 
        U_FirstName: null,
        U_LastName: null,
        tenantId: null, 
        tenantName: null, 
        tenantDomain: null,
        token: null, 
        isLoggedIn: false 
      }),

      logout: () => {
        // Accès direct au setter pour garantir la déconnexion
        set({ 
            U_Id: null, U_Email: null, U_Role: null, U_FirstName: null,
            U_LastName: null, tenantId: null, tenantName: null, 
            tenantDomain: null, token: null, isLoggedIn: false 
        });
      },
    }),
    {
      name: 'qs-elite-pwa-storage',
      // Utilisation du localStorage standard (PWA Native)
      storage: createJSONStorage(() => localStorage),
    }
  )
);