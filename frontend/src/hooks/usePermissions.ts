import { useMemo } from 'react';

export const usePermissions = () => {
  // Récupération de l'utilisateur stocké lors du login
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  const user = useMemo(() => userRaw ? JSON.parse(userRaw) : null, [userRaw]);

  const permissions = useMemo(() => {
    const isAdmin = user?.U_Role === 'ADMIN';
    const isElite = user?.U_Tenant?.T_Plan === 'ENTREPRISE';

    return {
      // Accès intégral si ADMIN + ENTREPRISE
      hasFullAccess: isAdmin && isElite,
      // Accès aux outils de pilotage
      canGenerateReports: isElite,
      // Accès à la gestion des utilisateurs
      canManageUsers: isAdmin,
      // Accès au cockpit stratégique
      canSeeCockpit: isElite || isAdmin
    };
  }, [user]);

  return { user, ...permissions };
};