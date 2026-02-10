/**
 * CHEMIN ABSOLU : /frontend/src/store/authStore.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Store centralisé pour la persistance de session et le pilotage d'accès.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * 👤 AUTH USER INTERFACE : Architecture Elite MS
 * Typage souverain pour garantir l'intégrité des données Master et Collaborateurs.
 * CORRECTION : Ajout de U_TenantName pour éviter les "undefined" dans le Dashboard.
 */
export interface AuthUser {
  U_Id: string;
  U_Email: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  U_Role: string;
  tenantId: string;
  U_TenantName: string; // ✅ Aligné sur la réponse du Backend
  assignedProcessId?: string | null;
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
      
      /**
       * 🔑 SCELLAGE DE SESSION
       * Utilisé après la validation NextAuth pour synchroniser le Store Zustand.
       * Cette fonction scelle l'identité numérique dans le stockage local.
       */
      setLogin: (data) => {
        set({ 
          token: data.token, 
          tenantId: data.user.tenantId, 
          user: data.user 
        });
      },

      /**
       * 🛡️ PROTOCOLE DE DÉCONNEXION SOUVERAIN
       * Nettoyage intégral de toutes les traces de session pour éviter les accès fantômes.
       */
      logout: () => {
        if (typeof window !== 'undefined') {
          // 1. Suppression du scellé spécifique
          localStorage.removeItem('qualisoft-auth-storage');
          
          // 2. Nettoyage du cache de session
          sessionStorage.clear();
          
          // Note : La suppression des cookies sécurisés de NextAuth 
          // doit être pilotée par signOut() au niveau de la vue.
        }
        
        // 3. Reset de l'état atomique
        set({ 
          token: null, 
          tenantId: null, 
          user: null 
        });
      },
    }),
    { 
      name: 'qualisoft-auth-storage', // Nom unique pour la persistance Matrix
      storage: createJSONStorage(() => localStorage), // Synchronisation sécurisée
    }
  )
);