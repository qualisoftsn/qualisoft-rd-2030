import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function upgrade() {
  const email = 'ab.thiongane@qualisoft.sn';
  const updatedUser = await prisma.user.update({
    where: { U_Email: email },
    data: {
      U_Role: 'SUPER_ADMIN' // On passe du rôle limité au rôle total
    },
  });
  console.log('🚀 Compte débridé avec succès pour :', updatedUser.U_Email);
  console.log('🔑 Nouveau rôle :', updatedUser.U_Role);
}

upgrade()
  .catch((e) => { console.error('❌ Erreur :', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
