/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 🛡️ HOOK : use-auth.ts
 * -------------------------------------------------------------------------
 * RÔLE : Bridge de compatibilité vers le Store Zustand.
 * FIX : Redirection vers useAuthStore pour éliminer le besoin de React Context.
 */

import { useAuthStore } from '@/store/authStore';

// On exporte simplement le hook Zustand sous le nom attendu par les composants
export const useAuth = () => {
  const store = useAuthStore() as any;
  return {
    user: store.user,
    token: store.token,
    isAuthenticated: store.isAuthenticated,
    isMasterSession: store.isMasterSession,
    logout: store.logout
  };
};