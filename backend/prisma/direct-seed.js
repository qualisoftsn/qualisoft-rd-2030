import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const masterEmail = 'ab.thiongane@qualisoft.sn';
  const hashedPassword = await bcrypt.hash('Qualisoft@2026', 10);

  console.log('🏗️  DÉMARRAGE DU SCELLAGE DIRECT...');

  const masterTenant = await prisma.tenant.upsert({
    where: { T_Domain: 'matrix' },
    update: {},
    create: {
      T_Id: 'QS-2026-JANV',
      T_Name: 'QUALISOFT MATRIX CORE',
      T_Email: masterEmail,
      T_Domain: 'matrix',
      T_Plan: 'GROUPE',
      T_SubscriptionStatus: 'ACTIVE',
    },
  });

  const mainSite = await prisma.site.upsert({
    where: { S_Id: 'SITE-MASTER-001' },
    update: {},
    create: {
      S_Id: 'SITE-MASTER-001',
      S_Name: 'QUARTIER GÉNÉRAL MATRIX',
      tenantId: masterTenant.T_Id,
    },
  });

  await prisma.user.upsert({
    where: { U_Email: masterEmail },
    update: { U_PasswordHash: hashedPassword },
    create: {
      U_Email: masterEmail,
      U_PasswordHash: hashedPassword,
      U_FirstName: 'Abdoulaye',
      U_LastName: 'Thiongane',
      U_Role: 'SUPER_ADMIN',
      tenantId: masterTenant.T_Id,
      U_SiteId: mainSite.S_Id,
      U_FirstLogin: false,
    },
  });

  console.log('🏁 SCELLAGE RÉUSSI : Identité Master injectée.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });