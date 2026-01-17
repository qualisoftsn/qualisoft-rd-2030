import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  const email = 'ab.thiongane@qualisoft.sn';
  
  // 1. On aligne le rôle sur 'SUPERADMIN' (sans underscore comme dans votre code)
  // 2. On met à jour le Tenant pour qu'il soit en plan 'ENTREPRISE'
  const user = await prisma.user.findUnique({ where: { U_Email: email } });
  
  await prisma.user.update({
    where: { U_Email: email },
    data: { U_Role: 'SUPERADMIN' }
  });

  await prisma.tenant.update({
    where: { T_Id: user.tenantId },
    data: { T_Plan: 'ENTREPRISE' }
  });

  console.log('✅ Sidebar débloquée : Rôle=SUPERADMIN, Plan=ENTREPRISE');
}

fix()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
