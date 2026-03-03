/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * 👮 HOOK : usePermissions.ts
 * -------------------------------------------------------------------------
 * RÔLE : Calcul dynamique des droits (RBAC + Plan Compliance).
 * FIX : Suppression du localStorage.getItem (non-réactif) pour useAuthStore.
 * RÉVISION : 03 Mars 2026 | 01:25 GMT
 */

"use client";

import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';

export const usePermissions = () => {
  // ✅ FIX : On écoute le store Zustand pour être réactif aux déconnexions
  const user = useAuthStore((state: any) => state.user);

  const permissions = useMemo(() => {
    // Zero Trust Policy
    if (!user) return { 
      hasFullAccess: false, 
      isOwner: false, 
      isAdmin: false, 
      isElite: false,
      role: 'GUEST'
    };

    /**
     * ⚖️ ANALYSE DES PRIVILÈGES
     * isAdmin : Rang Admin ou SuperAdmin Matrix.
     * isElite : Accès aux fonctions Business Intelligence (Plan Elite/Entreprise).
     * isOwner : Accès souverain Qualisoft (Support & Audit).
     */
    const isAdmin = ['ADMIN', 'SUPERADMIN', 'ROOT'].includes(user.U_Role);
    const isElite = ['ELITE', 'ENTREPRISE'].includes(user.U_TenantPlan);
    const isOwner = user.U_Email?.endsWith('@qualisoft.sn') || user.U_Role === 'SUPERADMIN';

    return {
      user,
      isAdmin,
      isElite,
      isOwner,
      role: user.U_Role,
      /**
       * ⚡ hasFullAccess
       * Verrouille les configurations sensibles (SMI Global, Sites, Users).
       */
      hasFullAccess: (isAdmin && isElite) || isOwner,
      
      // Helper pour les actions granulaires
      canEdit: (authorId?: string) => isAdmin || user.U_Id === authorId,
      canAccessSite: (siteId: string) => user.U_SiteId === siteId || isAdmin,
    };
  }, [user]);

  return permissions;
};