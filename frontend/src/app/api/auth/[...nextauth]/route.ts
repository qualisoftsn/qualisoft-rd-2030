/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth, { NextAuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * 🛰️ TYPES SOUVERAINS - QUALISOFT ELITE RD 2030
 */
interface QualisoftUser extends User {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  tenantId: string;
  U_TenantName: string;
  U_TenantDomain: string; // Le slug (ex: "pad", "sagam")
  assignedProcessId?: string | null;
  accessToken: string;
}

const isProduction = process.env.NODE_ENV === "production";

/**
 * 🏛️ CONFIGURATION NEXTAUTH - NOYAU D'ISOLATION
 */
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
      async authorize(credentials) {
        if (!credentials) return null;

        // --- A. PROTOCOLE D'INCARNATION (Matrix Admin) ---
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
              U_LastName: user.U_LastName || "Matrix",
              tenantId: user.tenantId,
              U_TenantName: user.U_TenantName || "Matrix Node",
              U_TenantDomain: user.U_TenantDomain || "matrix",
              assignedProcessId: user.assignedProcessId || null,
              accessToken: credentials.impersonationToken,
            } as QualisoftUser;
          } catch (e) {
            console.error("Matrix Impersonation Error:", e);
            return null;
          }
        }

        // --- B. PROTOCOLE LOGIN CLASSIQUE (Multi-Tenant) ---
        if (!credentials.email || !credentials.password) return null;

        try {
          // Utilisation du tunnel interne Docker (backend:9000 défini dans compose)
          const backendUrl = process.env.API_URL_INTERNAL || "http://backend:9000/api";
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
              U_TenantDomain: userData.U_TenantDomain || userData.tenant?.T_Domain || "qs", 
              assignedProcessId: userData.assignedProcessId || null,
              accessToken: data.access_token || data.accessToken,
            } as QualisoftUser;
          }
          return null;
        } catch (error) {
          console.error("Auth System Failure:", error);
          return null;
        }
      },
    }),
  ],

  /**
   * 🍪 GESTIONNAIRE DE COOKIES SOUVERAINS
   * 🚩 IMPORTANT : On ne définit PAS de 'domain' pour forcer l'isolation par hostname.
   * Ainsi, une session sur pad.qualisoft.sn ne sera jamais visible sur sagam.qualisoft.sn.
   */
  cookies: {
    sessionToken: {
      name: `${isProduction ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
      }
    }
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as QualisoftUser;
        token.accessToken = u.accessToken;
        token.U_Id = u.U_Id;
        token.U_Role = u.U_Role;
        token.tenantId = u.tenantId;
        token.U_TenantName = u.U_TenantName;
        token.U_TenantDomain = u.U_TenantDomain;
        token.U_FirstName = u.U_FirstName;
        token.U_LastName = u.U_LastName;
        token.assignedProcessId = u.assignedProcessId;
      }
      return token;
    },

    async session({ session, token }) {
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
          U_TenantDomain: token.U_TenantDomain,
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
    error: "/auth/error" 
  },
  session: { 
    strategy: "jwt", 
    maxAge: 24 * 60 * 60 // 24 heures de validité
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };