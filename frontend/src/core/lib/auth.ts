import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "./prisma"; 
import bcrypt from "bcryptjs";

// 🟢 Extension des types pour inclure les données SAGAM (Tenant, ID)
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    tenantId: string;
    role: string;
  }
}

export const authOptions: NextAuthOptions = {
  // Liaison avec la base de données Qualisoft via Prisma
  adapter: PrismaAdapter(prisma),
  
  session: {
    strategy: "jwt", // Indispensable pour la performance et Docker
    maxAge: 8 * 60 * 60, // Session de 8 heures (Journée de travail standard)
  },

  providers: [
    CredentialsProvider({
      name: "Qualisoft Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "ab.thiongane@qualisoft.sn" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants requis");
        }

        // 🔍 Recherche de l'utilisateur dans le SMI
        const user = await prisma.user.findUnique({
          where: { U_Email: credentials.email },
        });

        // 🟢 CORRECTION CRITIQUE ICI :
        // On vérifie 'U_PasswordHash' au lieu de 'U_Password' car c'est le nom réel en base
        if (!user || !user.U_PasswordHash) {
          throw new Error("Utilisateur non enregistré");
        }

        // 🟢 CORRECTION CRITIQUE ICI AUSSI :
        // On compare le mot de passe saisi avec le hash stocké
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.U_PasswordHash // <-- C'était l'erreur (U_Password n'existe pas)
        );

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        // Vérification si le compte est actif (Sécurité supplémentaire)
        if (user.U_IsActive === false) {
             throw new Error("Compte désactivé. Contactez l'administrateur.");
        }

        // On retourne l'objet utilisateur avec les data SAGAM
        return {
          id: user.U_Id,
          email: user.U_Email,
          name: `${user.U_FirstName} ${user.U_LastName}`,
          tenantId: user.tenantId, // 👈 CRITIQUE pour la GED
          role: user.U_Role || "USER",
        };
      }
    })
  ],

  callbacks: {
    // 🟢 Injection des data dans le Token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tenantId = user.tenantId;
        token.role = user.role;
      }
      return token;
    },
    // 🟢 Injection des data dans la Session Frontend
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.tenantId = token.tenantId as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },

  pages: {
    signIn: "/auth/login", // Ta page de connexion personnalisée
    error: "/auth/error",
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET, // Doit être défini sur ton VPS OVH
};