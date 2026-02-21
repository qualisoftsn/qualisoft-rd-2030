/**
 * 🗄️ LIB : PRISMA CLIENT (MOTEUR POSTGRESQL MULTI-TENANT)
 * -------------------------------------------------------------------------
 * FONCTION : Singleton de connexion à la base de données.
 * RÔLE : Prévenir la saturation des pools de connexion (Fast Refresh Next.js).
 * ISOLATION : Point d'entrée unique pour l'exécution des requêtes SQL. 
 * Toute transaction doit être scellée par le Tenant ID.
 */

import { PrismaClient } from "@prisma/client";

// Empêche les multiples instances de Prisma en mode développement de surcharger la DB
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 🔍 AUDIT : Logs activés en dev pour tracer la performance et repérer 
    // toute requête qui ne contiendrait pas le filtre de Tenant.
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

// Scellage de l'instance dans l'environnement global hors production
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;