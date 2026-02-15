/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAuthStore, AuthUser } from "@/store/authStore"; // On importe le type du Store
import { Loader2 } from "lucide-react";

export default function AuthSync({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  
  // ✅ CORRECTION : On récupère uniquement setLogin qui est exposé par ton Store
  const setLogin = useAuthStore((state) => state.setLogin);
  const isAuthenticated = useAuthStore((state) => !!state.token);

  useEffect(() => {
    // Si NextAuth est connecté MAIS que le Store Zustand est vide...
    if (status === "authenticated" && session && !isAuthenticated) {
      
      const token = (session as any).accessToken;
      const user = session.user as any; // On force le type car on sait ce qu'on reçoit de route.ts

      if (token && user) {
        console.log("🔄 [SYNC] Injection de l'identité Matrix dans le Store...");
        
        // 1. On construit l'objet User strict pour satisfaire TypeScript
        const matrixUser: AuthUser = {
          U_Id: user.U_Id || user.id,
          U_Email: user.email || user.U_Email,
          U_FirstName: user.U_FirstName,
          U_LastName: user.U_LastName,
          U_Role: user.U_Role,
          tenantId: user.tenantId,
          U_TenantName: user.U_TenantName || "Organisation",
          assignedProcessId: user.assignedProcessId
        };

        // 2. On appelle la méthode unique du Store
        setLogin({
          token: token,
          user: matrixUser
        });

        // 3. On force le LocalStorage pour l'API Client (Ceinture de sécurité)
        localStorage.setItem('token', token);
        if (user.U_Role === 'SUPER_ADMIN') {
            localStorage.setItem('master_token', token);
        }
      }
    }
  }, [session, status, isAuthenticated, setLogin]);

  // Optionnel : Petit loader pendant la synchro (évite le flash de contenu non-connecté)
  if (status === "loading") {
      return null; // Ou un spinner <Loader2 ... />
  }

  return <>{children}</>;
}