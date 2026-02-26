import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
        tenantId: { label: 'Tenant ID', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password || !credentials?.tenantId) {
          throw new Error('Missing credentials');
        }

        // 🔑 AUTHENTIFICATION SÉCURISÉE AVEC PRISMA
        const user = await prisma.user.findFirst({
          where: {
            U_Email: credentials.email.toLowerCase().trim(),
            U_IsActive: true,
            tenantId: credentials.tenantId === 'MATRIX' ? undefined : credentials.tenantId,
          },
          include: {
            tenant: true,
          },
        });

        if (!user || !user.U_PasswordHash) {
          throw new Error('Invalid credentials');
        }

        const isValid = await bcrypt.compare(credentials.password, user.U_PasswordHash);
        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.U_Id,
          email: user.U_Email,
          firstName: user.U_FirstName,
          lastName: user.U_LastName,
          role: user.U_Role,
          tenantId: user.tenantId,
          tenantDomain: user.tenant?.T_Domain || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.tenantDomain = user.tenantDomain;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.tenantId = token.tenantId;
        session.user.tenantDomain = token.tenantDomain;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 15 * 60, // 15 minutes (aligné sur le backend NestJS)
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: true,
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };