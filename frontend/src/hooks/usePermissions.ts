import { useMemo } from 'react';

export const usePermissions = () => {
  // 1. On récupère le store spécifique identifié sur ta capture
  const storageRaw = typeof window !== 'undefined' ? localStorage.getItem('qualisoft-auth-storage') : null;

  const user = useMemo(() => {
    if (!storageRaw) return null;
    try {
      const parsed = JSON.parse(storageRaw);
      // Extraction suivant la structure de ta capture : state -> user
      return parsed.state?.user || null;
    } catch (e) {
      console.error("Erreur parsing storage", e);
      return null;
    }
  }, [storageRaw]);

  const permissions = useMemo(() => {
    // Si pas d'utilisateur, on verrouille tout par défaut
    if (!user) return { isSuperAdmin: false, isAdmin: false, canGenerateReports: false, hasFullAccess: false };

    // 👑 Détection SUPER_ADMIN (Basée sur ta capture U_Role: "SUPER_ADMIN")
    const role = user.U_Role?.toUpperCase();
    const isSuperAdmin = role === 'SUPER_ADMIN' || user.U_Email === 'ab.thiongane@qualisoft.sn';
    
    const isAdmin = isSuperAdmin || role === 'ADMIN';

    // ⏳ Logique de déblocage (On force tout à true pour le Super Admin)
    return {
      isSuperAdmin,
      isAdmin,
      canGenerateReports: isSuperAdmin || user.U_Tenant?.T_Plan === 'ELITE',
      hasFullAccess: isSuperAdmin || (isAdmin && user.U_Tenant?.T_Plan === 'ELITE'),
      canSeeCockpit: true,
      canEdit: isSuperAdmin || user.U_Tenant?.T_SubscriptionStatus !== 'EXPIRED'
    };
  }, [user]);

  return { user, ...permissions };
};