import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// --- Types alignés sur le Schéma Prisma ---
// Ces types garantissent que l'App mobile manipule les mêmes objets que le Backend NestJS
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
  // Permet de mettre à jour tout ou partie de l'état (ex: après le login ou un refresh de profil)
  setLogin: (userData: Partial<UserState>) => void;
  // Réinitialise tout pour une déconnexion propre
  setLogout: () => void;
  // Permet de mettre à jour le token uniquement
  updateToken: (newToken: string) => void;
}

/**
 * Store d'Authentification Elite
 * Utilise Zustand avec persistance via AsyncStorage pour que l'utilisateur 
 * ne soit pas déconnecté à chaque fermeture de l'application.
 */
export const useAuthStore = create<UserState & AuthActions>()(
  persist(
    (set) => ({
      // État Initial
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

      // Actions
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
    }),
    {
      name: 'qs-elite-auth-storage', // Clé unique dans le stockage du téléphone
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);