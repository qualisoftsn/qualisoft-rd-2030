/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useEffect, useState } from 'react';

export const usePermissions = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error("Erreur de lecture de la session");
      }
    }
  }, []);

  const permissions = useMemo(() => {
    if (!user) return { hasFullAccess: false, isOwner: false };

    const isAdmin = user.U_Role === 'ADMIN';
    const isElite = user.U_Tenant?.T_Plan === 'ENTREPRISE';
    // On identifie le propriétaire Qualisoft par son email
    const isOwner = user.U_Email?.includes('@qualisoft.sn') || user.U_Role === 'SUPERADMIN';

    return {
      isAdmin,
      isElite,
      isOwner,
      // Accès intégral si c'est Pierre (Admin + Entreprise) ou Toi (Owner)
      hasFullAccess: (isAdmin && isElite) || isOwner,
    };
  }, [user]);

  return { user, ...permissions };
};