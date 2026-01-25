// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: string;
  tenantId: string; // Doit correspondre au T_Id du schéma
}

interface AuthState {
  token: string | null;
  tenantId: string | null;
  user: AuthUser | null;
  setLogin: (data: { token: string; user: AuthUser }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      tenantId: null,
      user: null,
      setLogin: (data) => {
        // ✅ On s'assure d'extraire le tenantId depuis l'objet user reçu (vu en F12)
        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user 
        });
      },
      logout: () => {
        if (typeof window !== 'undefined') localStorage.clear();
        set({ token: null, tenantId: null, user: null });
      },
    }),
    { name: 'qualisoft-auth-storage' } // 🔑 LA clé unique obligatoire
  )
);