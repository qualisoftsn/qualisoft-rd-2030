/**
 * 🗄️ LIB : PRISMA CLIENT (ORCHESTRATEUR DB)
 * -------------------------------------------------------------------------
 * FONCTION : Singleton de connexion à la base de données.
 * RÔLE : Exécution des requêtes SQL via l'ORM Prisma.
 * ISOLATION : Toutes les requêtes doivent inclure un filtre 'tenantId' 
 * pour garantir le cloisonnement des données (Multi-Tenancy).
 */

import { PrismaClient } from '@prisma/client';

// Prévention de l'épuisement des connexions en mode Développement (Next.js Fast Refresh)
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Log des requêtes en dev pour auditer les fuites de Tenant
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// Scellage de l'instance dans l'objet global hors production
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;