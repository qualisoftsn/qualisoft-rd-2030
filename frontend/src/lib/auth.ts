/**
 * 🔐 PROTOCOLE DE SÉCURITÉ ALPHA - QUALISOFT ELITE
 * -------------------------------------------------------------------------
 * RÔLE : Authentification Souveraine & Bypass Master.
 * MÉCANISME : NextAuth avec session JWT stricte.
 * ISOLATION : Injection du TenantId directement dans le jeton signé.
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma"; // Chemin corrigé selon ta structure
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: "jwt", 
    maxAge: 8 * 60 * 60 // Expiration à 8h (Quart de travail standard)
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: { 
        httpOnly: true, 
        sameSite: 'lax', 
        path: '/', 
        secure: process.env.NODE_ENV === 'production' 
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Matrix Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        tenantId: { label: "ID Instance", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Saisie des accréditations requise.");
        }

        const email = credentials.email.toLowerCase().trim();

        // 👑 BYPASS MASTER (GOD MODE) : PRIORITÉ ABSOLUE
        if (email === 'ab.thiongane@qualisoft.sn' && credentials.password === 'Qualisoft@2026') {
          console.log("⚡ QUALISOFT KERNEL : Surcharge Master autorisée.");
          return {
            id: "CORE_MASTER",
            U_Id: "CORE_MASTER",
            U_Email: email,
            U_Role: "SUPER_ADMIN",
            tenantId: "MATRIX_CORE", 
            U_TenantName: "QUALISOFT MASTER CONSOLE",
            U_FirstName: "Abdoulaye",
            U_LastName: "Thiongane",
            U_AssignedProcessId: null,
            email: email,
            name: "A. Thiongane (Architecte Master)"
          };
        }

        // 🔍 VÉRIFICATION STANDARD (SCELLÉE AU TENANT)
        const user = await prisma.user.findUnique({
          where: { U_Email: email },
          include: { tenant: true }
        });

        if (!user || !user.U_PasswordHash) {
          throw new Error("Identité non reconnue dans la Matrice.");
        }
        
        const isValid = await bcrypt.compare(credentials.password, user.U_PasswordHash);
        if (!isValid) throw new Error("Accréditation rejetée (Mot de passe).");
        if (!user.U_IsActive) throw new Error("Compte utilisateur suspendu.");

        // Validation croisée du Tenant (Si le composant de login l'exige)
        if (credentials.tenantId && user.tenantId !== credentials.tenantId) {
            throw new Error("Violation de périmètre : Ce compte n'appartient pas à cette instance.");
        }

        return {
          id: user.U_Id,
          U_Id: user.U_Id,
          U_Email: user.U_Email,
          U_Role: user.U_Role,
          tenantId: user.tenantId,
          U_TenantName: user.tenant?.T_Name || "Qualisoft SDE",
          U_FirstName: user.U_FirstName,
          U_LastName: user.U_LastName,
          U_AssignedProcessId: user.U_AssignedProcessId,
          email: user.U_Email,
          name: `${user.U_FirstName} ${user.U_LastName}`
        };
      }
    })
  ],
  callbacks: {
    // 🧬 SCELLAGE DU JWT
    async jwt({ token, user }) {
      if (user) {
        token.U_Id = user.U_Id;
        token.U_Role = user.U_Role;
        token.tenantId = user.tenantId; // <-- La clé de l'isolation
        token.U_TenantName = user.U_TenantName;
        token.U_FirstName = user.U_FirstName;
        token.U_LastName = user.U_LastName;
      }
      return token;
    },
    // 🧬 HYDRATATION DE LA SESSION CLIENT
    async session({ session, token }) {
      if (token && session.user) {
        session.user.U_Id = token.U_Id as string;
        session.user.U_Role = token.U_Role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.U_TenantName = token.U_TenantName as string;
        session.user.U_FirstName = token.U_FirstName as string;
        session.user.U_LastName = token.U_LastName as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};