import { PrismaClient } from '@prisma/client';
import { seedSagam } from './seed-sagam'; // Ton fichier avec Pierre Ndiaye

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding global...');
  
  // ⚠️ TRÈS IMPORTANT : Il faut le "await" ici
  await seedSagam(); 
  
  console.log('🏁 Seeding terminé.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });