/* eslint-disable @typescript-eslint/no-unused-vars */
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

// 🍪 LOGIQUE SOUVERAINE DES COOKIES
// En production, on partage le cookie sur tout le domaine (*.qualisoft.sn)
// En local, on reste sur localhost pour éviter les conflits.
const useSecureCookies = process.env.NODE_ENV === 'production';
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const hostPrefix = useSecureCookies ? '__Host-' : '';
const cookieDomain = useSecureCookies ? '.qualisoft.sn' : undefined; // 👈 LA CLÉ DU MULTI-TENANT

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "Tenant ID", type: "text" }, // ✅ Ajouté pour le contexte
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
          const backendUrl = process.env.INTERNAL_API_URL || "http://backend:9000/api";
          const targetTenantId = credentials.tenantId || "MATRIX";

          // 📡 Appel au Backend (NestJS)
          const res = await fetch(`${backendUrl}/auth/login`, {
            method: "POST",
            body: JSON.stringify({
              email: credentials.email.toLowerCase().trim(),
              password: credentials.password,
              // Le backend n'a pas forcément besoin du tenantId dans le body s'il est dans le header
              // mais on peut l'envoyer pour être sûr.
            }),
            headers: { 
              "Content-Type": "application/json",
              // 🔑 C'EST ICI QUE LE BACKEND SAIT QUELLE BASE INTERROGER :
              "x-tenant-id": targetTenantId 
            },
          });

          const data = await res.json();

          if (res.ok && data) {
            // Adaptation selon la réponse de ton backend (LoginResponse)
            // Parfois la réponse est direct { access_token, user: {...} }
            const userData = data.user || data; 

            // ✅ MAPPAGE INTÉGRAL SANS PERTE DE DONNÉES
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
          
          console.error(`[AUTH ECHEC] Backend a répondu: ${res.status}`, data);
          return null;
        } catch (error: unknown) {
          console.error(`[CRITIQUE] Rupture de pont Matrix:`, error);
          return null;
        }
      },
    }),
  ],
  
  // 🍪 CONFIGURATION DES COOKIES PARTAGÉS
  // Indispensable pour que SDE.QUALISOFT.SN lise la session créée
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: useSecureCookies,
        domain: cookieDomain // 🔥 C'est ça qui débloque le multi-tenant
      }
    }
  },

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
    maxAge: 24 * 60 * 60, // 24 heures
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development', // Aide au debug en dev
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };