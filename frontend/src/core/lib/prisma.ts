/**
 * 🗄️ LIB : Prisma Client Singleton
 * -------------------------------------------------------------------------
 * RÔLE : Gestionnaire de connexion unique au Noyau PostgreSQL.
 * RÉVISION : 03 Mars 2026 | 01:25 GMT
 */

import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    // Logging restrictif pour éviter les fuites de données en console
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// ✅ SÉCURITÉ : Empêche la multiplication des connexions lors des Hot-Reloads (Next.js)
export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

export default prisma;