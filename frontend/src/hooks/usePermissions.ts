'use client';
/**
 * 🛡️ HOOK : USE PERMISSIONS (CONTRÔLE D'ACCÈS RBAC)
 * -------------------------------------------------------------------------
 * FONCTION : Évaluation en temps réel des privilèges de l'utilisateur actif.
 * RÔLE : Verrouiller les interfaces selon la combinaison Rôle + Licence Tenant.
 * ROBUSTESSE : Gère le fallback si le store Zustand est corrompu.
 */

import { useMemo } from 'react';

export const usePermissions = () => {
  // 1. Extraction asynchrone sécurisée du State Zustand (Qualisoft Store)
  const storageRaw = typeof window !== 'undefined' ? localStorage.getItem('qualisoft-auth-storage') : null;

  const user = useMemo(() => {
    if (!storageRaw) return null;
    try {
      const parsed = JSON.parse(storageRaw);
      return parsed.state?.user || null;
    } catch (e) {
      console.error("Qualisoft Error: Corruption du cache d'identité.", e);
      return null;
    }
  }, [storageRaw]);

  const permissions = useMemo(() => {
    // Zero Trust : Si pas d'user, on ferme toutes les portes.
    if (!user) {
      return { 
        isSuperAdmin: false, 
        isAdmin: false, 
        canGenerateReports: false, 
        hasFullAccess: false,
        canEdit: false,
        canSeeCockpit: false 
      };
    }

    // 👑 DÉTECTION DU BYPASS MASTER (Thiongane ou rôle SUPER_ADMIN explicite)
    const role = user.U_Role?.toUpperCase();
    const isSuperAdmin = role === 'SUPER_ADMIN' || user.U_Email === 'ab.thiongane@qualisoft.sn';
    
    // Un SuperAdmin est techniquement aussi un Admin
    const isAdmin = isSuperAdmin || role === 'ADMIN';

    // 📊 ÉVALUATION DU PÉRIMÈTRE
    // Un utilisateur standard en licence ELITE a des droits étendus
    const isElitePlan = user.U_Tenant?.T_Plan === 'ELITE' || user.U_Tenant?.T_Plan === 'ENTREPRISE';
    const isLicenseActive = user.U_Tenant?.T_SubscriptionStatus !== 'EXPIRED';

    return {
      isSuperAdmin,
      isAdmin,
      // Le Master génère toujours des rapports, sinon ça dépend du plan du Tenant
      canGenerateReports: isSuperAdmin || isElitePlan,
      // Le FullAccess (paramétrage profond) requiert d'être Admin + Elite
      hasFullAccess: isSuperAdmin || (isAdmin && isElitePlan),
      // Le Cockpit est le centre névralgique, tout utilisateur authentifié peut le voir
      canSeeCockpit: true,
      // 🔒 VERROU DE LICENCE : Seul le SuperAdmin peut écrire sur un Tenant expiré
      canEdit: isSuperAdmin || isLicenseActive
    };
  }, [user]);

  return { user, ...permissions };
};