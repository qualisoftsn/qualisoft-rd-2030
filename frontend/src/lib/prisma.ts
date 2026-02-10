/**
 * CHEMIN ABSOLU : /src/lib/prisma.ts
 * PROJET : Qualisoft Elite (Frontend)
 * RÔLE : Singleton Prisma Client pour éviter l'épuisement des connexions
 */

import { PrismaClient } from "@prisma/client";

// Empêche les multiples instances de Prisma en mode développement
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;