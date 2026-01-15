import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterAdmin() {
  console.log('🛡️  Synchronisation du Noyau Master Qualisoft...');

  const masterEmail = 'ab.thiongane@qualisoft.sn';
  const hashedPassword = await bcrypt.hash('mohamed1965ab1711@', 10);

  // 1. GARANTIE DU TENANT MASTER (QUALISOFT CORPORATE)
  const qualisoftTenant = await prisma.tenant.upsert({
    where: { T_Email: masterEmail },
    update: {
      T_Name: 'QUALISOFT CORPORATE',
      T_Domain: 'qualisoft.sn',
      T_SubscriptionStatus: 'ACTIVE',
      T_IsActive: true,
      T_Plan: 'GROUPE',
    },
    create: {
      T_Name: 'QUALISOFT CORPORATE',
      T_Email: masterEmail,
      T_Domain: 'qualisoft.sn',
      T_SubscriptionStatus: 'ACTIVE',
      T_IsActive: true,
      T_Plan: 'GROUPE',
      T_ContractDuration: 99,
      T_TacitRenewal: true,
    },
  });

  // 2. GARANTIE DE L'ADMINISTRATEUR UNIVERSEL
  const masterAdmin = await prisma.user.upsert({
    where: { U_Email: masterEmail },
    update: {
      U_FirstName: 'Abdoulaye',
      U_LastName: 'THIONGANE',
      U_PasswordHash: hashedPassword, // Permet la réinitialisation automatique si perdu
      U_Role: 'ADMIN',
    },
    create: {
      U_FirstName: 'Abdoulaye',
      U_LastName: 'THIONGANE',
      U_Email: masterEmail,
      U_PasswordHash: hashedPassword,
      U_Role: 'ADMIN',
      tenantId: qualisoftTenant.T_Id,
    },
  });

  console.log(`✅ Noyau Master Scellé : ${masterAdmin.U_Email}`);
}

seedMasterAdmin()
  .catch((e) => {
    console.error('❌ Erreur de déploiement Master :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });