/**
 * CHEMIN ABSOLU : /frontend/src/types/next-auth.d.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Extension des types natifs NextAuth pour supporter l'identité souveraine Matrix.
 */

import { DefaultSession } from "next-auth";
import { JWT as NextAuthJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * 🛡️ EXTENSION DE LA SESSION
   */
  interface Session {
    accessToken?: string;
    user: {
      U_Id: string;
      U_Email: string;
      U_FirstName: string | null;
      U_LastName: string | null;
      U_Role: string;
      tenantId: string;
      U_TenantName: string; // ✅ Requis pour l'affichage Dashboard
      U_AssignedProcessId: string | null; // ✅ Aligné avec Prisma
    } & DefaultSession["user"];
  }

  /**
   * 👤 EXTENSION DE L'UTILISATEUR
   */
  interface User {
    U_Id: string;
    U_Email: string;
    U_FirstName: string | null;
    U_LastName: string | null;
    U_Role: string;
    tenantId: string;
    U_TenantName: string;
    U_AssignedProcessId: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * 🔑 EXTENSION DU JWT
   */
  interface JWT extends NextAuthJWT {
    U_Id: string;
    U_Email: string;
    U_FirstName: string | null;
    U_LastName: string | null;
    U_Role: string;
    tenantId: string;
    U_TenantName: string;
    U_AssignedProcessId: string | null;
    accessToken?: string;
  }
}