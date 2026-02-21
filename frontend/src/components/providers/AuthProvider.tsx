'use client';

/**
 * 🔐 MODULE : AuthProvider
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation du contexte d'authentification NextAuth.
 * FONCTION : Distribue les jetons de session (JWT) à l'ensemble de l'arbre 
 * de composants pour permettre l'isolation multi-tenant.
 */

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // SessionProvider encapsule l'application pour fournir l'état de session
  // indispensable à la récupération du profil utilisateur et de son TenantId.
  return <SessionProvider>{children}</SessionProvider>;
}