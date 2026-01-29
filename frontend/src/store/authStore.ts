import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: string;
  tenantId: string;
  assignedProcessId?: string | null; // 🚀 L'ID du processus rattaché
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
        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user 
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('qualisoft-auth-storage');
          localStorage.clear();
        }
        set({ token: null, tenantId: null, user: null });
      },
    }),
    { 
      name: 'qualisoft-auth-storage',
      // Optionnel : s'assurer que le stockage est bien synchronisé
    }
  )
);