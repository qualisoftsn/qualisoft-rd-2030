/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

// ---------------------------------------------------------
// 1. DÉFINITION LOCALE DES TYPES (Pour éviter les conflits globaux)
// ---------------------------------------------------------
interface QualisoftUser extends User {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  tenantId: string;
  U_TenantName: string;
  assignedProcessId?: string | null;
  accessToken: string;
}

// ---------------------------------------------------------
// 2. CONFIGURATION
// ---------------------------------------------------------
const isProduction = process.env.NODE_ENV === "production";
const rootDomain = "qualisoft.sn"; 

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" },
        impersonationToken: { label: "Token", type: "text" },
        impersonatedUser: { label: "UserJson", type: "text" }
      },
      // CORRECTION LIGNE 71 : On gère le type credentials explicitement
      async authorize(credentials: Record<string, string> | undefined) {
        
        // Sécurité : Si pas de credentials, on refuse
        if (!credentials) return null;

        // A. CAS INCARNATION (Impersonation)
        if (credentials.impersonationToken && credentials.impersonatedUser) {
          try {
            const user = JSON.parse(credentials.impersonatedUser);
            return {
              id: user.U_Id,
              U_Id: user.U_Id,
              U_Email: user.U_Email,
              name: `${user.U_Email} (Incarné)`,
              email: user.U_Email,
              U_Role: user.U_Role,
              U_FirstName: user.U_FirstName || "Admin",
              U_LastName: user.U_LastName || "Incarnated",
              tenantId: user.tenantId,
              U_TenantName: user.U_TenantName || "Matrix Node",
              assignedProcessId: user.assignedProcessId || null,
              accessToken: credentials.impersonationToken,
            } as QualisoftUser;
          } catch (e) {
            console.error("[NEXT-AUTH] Erreur Incarnation:", e);
            return null;
          }
        }

        // B. CAS LOGIN CLASSIQUE
        if (!credentials.email || !credentials.password) return null;

        try {
          // Communication Interne Docker
          const backendUrl = "http://backend:9000/api";
          const targetTenantId = credentials.tenantId || "MATRIX";

          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email.toLowerCase().trim(),
              password: credentials.password,
            }),
            headers: { 
              "Content-Type": "application/json",
              "x-tenant-id": targetTenantId 
            },
          });

          const data = await res.json();

          if (res.ok && data) {
            const userData = data.user || data;
            
            // Retour objet typé
            return {
              id: userData.U_Id,
              U_Id: userData.U_Id,
              U_Email: userData.U_Email,
              name: `${userData.U_FirstName} ${userData.U_LastName}`,
              email: userData.U_Email,
              U_Role: userData.U_Role,
              U_FirstName: userData.U_FirstName,
              U_LastName: userData.U_LastName,
              tenantId: userData.tenantId || targetTenantId,
              U_TenantName: userData.U_TenantName || "Organisation",
              assignedProcessId: userData.assignedProcessId || null,
              accessToken: data.access_token || data.accessToken,
            } as QualisoftUser;
          }
          
          return null;
        } catch (error) {
          console.error(`[AUTH] Erreur connexion Backend:`, error);
          return null;
        }
      },
    }),
  ],

  // 🍪 COOKIES SÉCURISÉS (Correction Session Blink)
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        // Force le cookie sur .qualisoft.sn pour qu'il soit vu par les sous-domaines
        domain: isProduction ? '.' + rootDomain : undefined 
      }
    },
    callbackUrl: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        domain: isProduction ? '.' + rootDomain : undefined
      }
    }
  },

  callbacks: {
    // 1. JWT : On force le typage (as any) pour éviter les erreurs "Property does not exist"
    async jwt({ token, user }) {
      if (user) {
        const u = user as QualisoftUser;
        token.accessToken = u.accessToken;
        token.U_Id = u.U_Id;
        token.U_Role = u.U_Role;
        token.tenantId = u.tenantId;
        token.U_TenantName = u.U_TenantName;
        token.U_FirstName = u.U_FirstName;
        token.U_LastName = u.U_LastName;
        token.assignedProcessId = u.assignedProcessId;
      }
      return token;
    },

    // 2. SESSION : On passe les infos au Frontend
    async session({ session, token }) {
      // On utilise "as any" pour dire à TypeScript de nous faire confiance
      const extendedSession = session as any;
      
      if (token) {
        extendedSession.accessToken = token.accessToken;
        extendedSession.user = {
          ...session.user,
          U_Id: token.U_Id,
          U_Email: token.email,
          U_Role: token.U_Role,
          tenantId: token.tenantId,
          U_TenantName: token.U_TenantName,
          U_FirstName: token.U_FirstName,
          U_LastName: token.U_LastName,
          assignedProcessId: token.assignedProcessId,
        };
      }
      return extendedSession;
    },
  },
  
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };