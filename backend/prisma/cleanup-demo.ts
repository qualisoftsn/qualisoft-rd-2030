import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- 🧹 NETTOYAGE DES DONNÉES DE DÉMO QUALISOFT ---');

  // 1. Liste des domaines de démo à supprimer
  const demoDomains = ['senbio.sn', 'translog.sn', 'elite.sn'];

  // 2. Suppression des Tenants de démo
  // Grâce au "onDelete: Cascade" de ton schéma, cela supprimera 
  // automatiquement les Utilisateurs, Sites, Compétences, etc. liés.
  const deletedTenants = await prisma.tenant.deleteMany({
    where: {
      T_Domain: { in: demoDomains }
    }
  });

  console.log(`✅ Nettoyage terminé : ${deletedTenants.count} organisations de démo supprimées.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });