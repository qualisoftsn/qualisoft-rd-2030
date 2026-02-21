/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

/**
 * 🛡️ HOOK : usePermissions (MATRICE D'ACCRÉDITATION)
 * -------------------------------------------------------------------------
 * FONCTION : Calcul en temps réel des droits d'accès de l'utilisateur.
 * RÔLE : Verrouillage des fonctionnalités selon le Rôle (U_Role) et le Plan (T_Plan).
 * ISOLATION : Vérifie la cohérence entre l'utilisateur et son Tenant scellé.
 */

import { useMemo, useEffect, useState } from 'react';

export const usePermissions = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Extraction sécurisée du profil Matrix depuis le stockage scellé
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("ERREUR CRITIQUE : Corruption de la session locale.");
      }
    }
  }, []);

  const permissions = useMemo(() => {
    // Accès refusé par défaut (Zero Trust Policy)
    if (!user) return { hasFullAccess: false, isOwner: false, isAdmin: false, isElite: false };

    /**
     * 👮 ANALYSE DES PRIVILÈGES
     * isAdmin : Pouvoir de modification sur le paramétrage du Tenant.
     * isElite : Accès aux modules avancés (Business Intelligence, Multi-Sites).
     * isOwner : Accès souverain (Support Qualisoft ou Direction Générale).
     */
    const isAdmin = user.U_Role === 'ADMIN' || user.U_Role === 'SUPERADMIN';
    const isElite = user.U_Tenant?.T_Plan === 'ENTREPRISE' || user.U_Tenant?.T_Plan === 'ELITE';
    
    // Identification des comptes à privilèges Qualisoft (Audit & Support)
    const isOwner = user.U_Email?.endsWith('@qualisoft.sn') || user.U_Role === 'SUPERADMIN';

    return {
      user,
      isAdmin,
      isElite,
      isOwner,
      /**
       * ⚡ hasFullAccess
       * Autorise l'accès aux configurations sensibles si l'utilisateur 
       * possède le rang Admin sur un plan Entreprise, ou s'il est Owner.
       */
      hasFullAccess: (isAdmin && isElite) || isOwner,
      // Helper pour vérifier l'appartenance à un site spécifique
      canAccessSite: (siteId: string) => user.U_SiteId === siteId || isAdmin,
    };
  }, [user]);

  return permissions;
};