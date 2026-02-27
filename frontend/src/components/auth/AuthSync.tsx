/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * ðŸ›°ï¸ MODULE : AuthSync
 * -------------------------------------------------------------------------
 * FONCTION : Synchronisation bidirectionnelle NextAuth <-> Zustand Matrix Store.
 * RÃ”LE : Injection des claims de session dans le store global pour l'isolation.
 * SÃ‰CURITÃ‰ : Scellage du token et identification du pÃ©rimÃ¨tre Tenant.
 */

'use client';

import { useAuth } from '@/core/providers/auth-provider';
import { useEffect } from "react";
import { useAuthStore, AuthUser } from "@/store/authStore";
import { Loader2 } from "lucide-react";

export default function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useAuth();
  
  // AccÃ¨s aux mÃ©thodes de persistence du store souverain
  const setLogin = useAuthStore((state) => state.setLogin);
  const isAuthenticated = useAuthStore((state) => !!state.token);

  useEffect(() => {
    /**
     * ðŸ” PROTOCOLE D'INJECTION MATRIX
     * Se dÃ©clenche dÃ¨s que NextAuth valide la session mais que le store Matrix est vide.
     */
    if (status === "authenticated" && session && !isAuthenticated) {
      
      const token = (session as any).accessToken;
      const user = session.user as any; 

      if (token && user) {
        // Validation de la prÃ©sence du TenantId pour l'isolation multi-tenant
        if (!user.tenantId && user.U_Role !== 'SUPER_ADMIN') {
          console.error("ðŸš¨ [CRITICAL] Tentative de session sans ancrage organisationnel.");
          return;
        }

        // 1. Construction de l'identitÃ© Matrix conforme au SMI
        const matrixUser: AuthUser = {
          U_Id: user.U_Id || user.id,
          U_Email: user.email || user.U_Email,
          U_FirstName: user.U_FirstName || "",
          U_LastName: user.U_LastName || "",
          U_Role: user.U_Role,
          tenantId: user.tenantId,
          U_TenantName: user.U_TenantName || "Organisation",
          assignedProcessId: user.assignedProcessId
        };

        console.log(`ðŸ”„ [SYNC] Scellage session pour : ${matrixUser.U_Email} (Tenant: ${matrixUser.tenantId})`);
        
        // 2. Hydratation du Store global (Zustand)
        setLogin({
          token: token,
          user: matrixUser
        });

        // 3. Persistence physique (Ceinture de sÃ©curitÃ© pour les appels API hors-React)
        // localStorage.setItem('token', token);
        // localStorage.setItem('qs_tenant_id', user.tenantId); // Stockage explicite du tenant
        
        if (user.U_Role === 'SUPER_ADMIN') {
            // localStorage.setItem('master_token', token);
        }
      }
    }
  }, [session, status, isAuthenticated, setLogin]);

  // Protection du rendu pendant la phase de vÃ©rification du jeton
  if (isLoading) {
      return null;
  }

  return <>{children}</>;
}