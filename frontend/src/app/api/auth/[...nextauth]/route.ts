import NextAuth, { NextAuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * 🛰️ EXTENSION DES TYPES LOCALE
 * Rôle : Assurer que TypeScript valide tous les champs Qualisoft Elite RD 2030.
 */
interface QualisoftUser extends User {
  U_Id: string;
  U_Email: string;
  U_Role: string;
  U_FirstName: string | null;
  U_LastName: string | null;
  tenantId: string;
  U_TenantName: string; // ✅ Rétabli pour le Dashboard
  assignedProcessId?: string | null; // ✅ Rétabli pour le pilotage
  accessToken: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        impersonationToken: { label: "Token", type: "text" },
        impersonatedUser: { label: "UserJson", type: "text" }
      },
      async authorize(credentials): Promise<QualisoftUser | null> {
        
        // ---------------------------------------------------------
        // 🕵️ CAS 1 : INCARNATION (Passage Souverain)
        // ---------------------------------------------------------
        if (credentials?.impersonationToken && credentials?.impersonatedUser) {
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

        // ---------------------------------------------------------
        // 🔐 CAS 2 : LOGIN CLASSIQUE (Aligné sur le Backend)
        // ---------------------------------------------------------
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const backendUrl = process.env.INTERNAL_API_URL || "http://qualisoft-backend:9000/api";
          
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              // ✅ ALIGNEMENT CRITIQUE : Le Backend attend 'email' et 'password'
              email: credentials.email.toLowerCase().trim(),
              password: credentials.password,
            }),
            headers: { "Content-Type": "application/json" },
          });

          const data = await res.json();

          if (res.ok && data && data.user) {
            // ✅ MAPPAGE INTÉGRAL SANS PERTE DE DONNÉES
            return {
              id: data.user.U_Id,
              U_Id: data.user.U_Id,
              U_Email: data.user.U_Email,
              name: `${data.user.U_FirstName} ${data.user.U_LastName}`,
              email: data.user.U_Email,
              U_Role: data.user.U_Role,
              U_FirstName: data.user.U_FirstName,
              U_LastName: data.user.U_LastName,
              tenantId: data.user.tenantId,
              U_TenantName: data.user.U_TenantName,
              assignedProcessId: data.user.assignedProcessId || null,
              accessToken: data.access_token,
            } as QualisoftUser;
          }
          
          return null;
        } catch (error: unknown) {
          console.error(`[CRITIQUE] Rupture de pont Matrix:`, error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
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

    async session({ session, token }): Promise<Session> {
      // ✅ SCELLAGE SANS 'ANY'
      const extendedSession = session as Session & { 
        accessToken: string; 
        user: QualisoftUser 
      };
      
      if (token) {
        extendedSession.accessToken = token.accessToken as string;
        extendedSession.user = {
          ...session.user,
          U_Id: token.U_Id as string,
          U_Role: token.U_Role as string,
          tenantId: token.tenantId as string,
          U_TenantName: token.U_TenantName as string,
          U_FirstName: token.U_FirstName as string,
          U_LastName: token.U_LastName as string,
          assignedProcessId: token.assignedProcessId as string | null,
          accessToken: token.accessToken as string
        } as QualisoftUser;
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
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };