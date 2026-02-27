'use client';

/**
 * ðŸ” MODULE : AuthProvider
 * -------------------------------------------------------------------------
 * RÃ”LE : Initialisation du contexte d'authentification NextAuth.
 * FONCTION : Distribue les jetons de session (JWT) Ã  l'ensemble de l'arbre 
 * de composants pour permettre l'isolation multi-tenant.
 */

import { useAuth } from '@/core/providers/auth-provider';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // SessionProvider encapsule l'application pour fournir l'Ã©tat de session
  // indispensable Ã  la rÃ©cupÃ©ration du profil utilisateur et de son TenantId.
  return {children};
}