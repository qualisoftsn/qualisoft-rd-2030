/**
 * 🛰️ PROTOCOLE DE SÉCURITÉ ALPHA - QUALISOFT ELITE
 * RÔLE : Authentification Souveraine & Bypass Master
 */
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma"; 
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: { httpOnly: true, sameSite: 'lax', path: '/', secure: false },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Matrix Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantId: { label: "TenantId", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) throw new Error("Identifiants requis");

        const email = credentials.email.toLowerCase().trim();

        // 👑 BYPASS MASTER : PRIORITÉ ABSOLUE
        // Si c'est toi, on ne regarde même pas la base de données
        if (email === 'ab.thiongane@qualisoft.sn' && credentials.password === 'Qualisoft@2026') {
          return {
            id: "CORE_MASTER",
            U_Id: "CORE_MASTER",
            U_Email: email,
            U_Role: "SUPER_ADMIN",
            tenantId: "MATRIX", // Aligné sur ton image 2
            U_TenantName: "QUALISOFT MASTER CONSOLE",
            U_FirstName: "Abdoulaye",
            U_LastName: "Thiongane",
            U_AssignedProcessId: null,
            email: email,
            name: "Abdoulaye Thiongane (Master)"
          };
        }

        // 🔍 LOGIN STANDARD (Seulement si ce n'est pas le Master)
        const user = await prisma.user.findUnique({
          where: { U_Email: email },
          include: { tenant: true }
        });

        if (!user || !user.U_PasswordHash) throw new Error("Utilisateur inconnu");
        
        const isValid = await bcrypt.compare(credentials.password, user.U_PasswordHash);
        if (!isValid) throw new Error("Mot de passe incorrect");
        if (!user.U_IsActive) throw new Error("Compte désactivé");

        return {
          id: user.U_Id,
          U_Id: user.U_Id,
          U_Email: user.U_Email,
          U_Role: user.U_Role,
          tenantId: user.tenantId,
          U_TenantName: user.tenant?.T_Name || "Qualisoft Instance",
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
    async jwt({ token, user }) {
      if (user) {
        token.U_Id = user.U_Id;
        token.U_Role = user.U_Role;
        token.tenantId = user.tenantId;
        token.U_TenantName = user.U_TenantName;
        token.U_FirstName = user.U_FirstName;
        token.U_LastName = user.U_LastName;
      }
      return token;
    },
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