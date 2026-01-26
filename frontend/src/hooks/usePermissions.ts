import { useMemo } from 'react';

interface Tenant {
  T_Plan: string;
  T_SubscriptionStatus: 'ACTIVE' | 'TRIAL' | 'EXPIRED';
  T_SubscriptionEndDate?: string;
}

interface UserSession {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  U_TenantName?: string;
  U_Tenant?: Tenant;
}

export const usePermissions = () => {
  const userRaw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  
  const user = useMemo((): UserSession | null => {
    if (!userRaw) return null;
    try {
      return JSON.parse(userRaw);
    } catch { return null; }
  }, [userRaw]);

  const permissions = useMemo(() => {
    // 👑 RECONNAISSANCE ABSOLUE DU SUPER_ADMIN
    // On force la vérification sur l'email ET le rôle (insensible à la casse)
    const userEmail = user?.U_Email?.toLowerCase();
    const userRole = user?.U_Role?.toUpperCase();

    const isSuperAdmin = 
      userEmail === 'ab.thiongane@qualisoft.sn' || 
      userRole === 'SUPER_ADMIN' || 
      userRole === 'MASTER';

    const isAdmin = isSuperAdmin || userRole === 'ADMIN';

    // ⏳ ÉTAT DE LA LICENCE
    const tenant = user?.U_Tenant;
    const isElite = tenant?.T_Plan === 'ELITE' || tenant?.T_Plan === 'ENTREPRISE' || isSuperAdmin;
    const isTrial = tenant?.T_SubscriptionStatus === 'TRIAL';
    const endDate = tenant?.T_SubscriptionEndDate ? new Date(tenant.T_SubscriptionEndDate) : null;
    const isTrialActive = isTrial && endDate && new Date() <= endDate;

    // 🔬 DEBUG LOGS (À supprimer une fois débloqué)
    if (typeof window !== 'undefined' && user) {
      console.log("🛡️ PERMISSIONS CHECK:", {
        email: userEmail,
        role: userRole,
        isSuperAdmin,
        canGenerate: isSuperAdmin || isElite || isTrialActive
      });
    }

    return {
      isSuperAdmin,
      isAdmin,
      // 🚀 ICI ON DÉBLOQUE TOUT POUR LE SUPER_ADMIN
      canGenerateReports: isSuperAdmin ? true : (isElite || isTrialActive),
      canManageUsers: isAdmin,
      canSeeCockpit: true,
      hasFullAccess: isSuperAdmin ? true : (isAdmin && isElite),
      canEdit: isSuperAdmin ? true : (tenant?.T_SubscriptionStatus !== 'EXPIRED')
    };
  }, [user]);

  return { user, ...permissions };
};