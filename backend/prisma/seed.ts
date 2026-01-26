import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏁 Démarrage du seed Qualisoft Elite...');
  
  // Hashage du mot de passe "Éternel"
  const passwordEternel = 'mohamed1965ab1711@';
  const hashedPassword = await bcrypt.hash(passwordEternel, 10);

  // 1. CRÉATION DU TENANT (L'organisation mère Qualisoft)
  const tenant = await prisma.tenant.upsert({
    where: { T_Id: 'QS-2026-JANV' },
    update: {
      T_Name: 'Qualisoft',
      T_Email: 'qualisoft@qualisoft.sn',
      T_Domain: 'qualisoft',
      T_IsActive: true,
    },
    create: {
      T_Id: 'QS-2026-JANV',
      T_Name: 'Qualisoft',
      T_Email: 'qualisoft@qualisoft.sn',
      T_Domain: 'qualisoft',
      T_Plan: 'GROUPE' as any, // Utilisation de 'as any' pour bypasser les contraintes strictes d'enum si nécessaire
      T_SubscriptionStatus: 'ACTIVE' as any,
      T_IsActive: true,
      T_Address: 'Dakar, Sénégal',
      T_Phone: '+221 33 000 00 00',
      T_CeoName: 'Directeur Qualisoft',
    },
  });
  console.log(`✅ Tenant Qualisoft (ID: ${tenant.T_Id}) prêt.`);

  // 2. CRÉATION DU SITE (Point d'ancrage physique)
  const site = await prisma.site.upsert({
    where: { S_Id: 'SITE-QS-MASTER' },
    update: {
      S_Name: 'Siège Social Qualisoft',
    },
    create: {
      S_Id: 'SITE-QS-MASTER',
      S_Name: 'Siège Social Qualisoft',
      tenantId: tenant.T_Id,
    },
  });
  console.log(`📍 Site Maître (ID: ${site.S_Id}) prêt.`);

  // 3. CRÉATION DU SUPER ADMIN (Abdoulaye)
  const user = await prisma.user.upsert({
    where: { U_Email: 'ab.thiongane@qualisoft.sn' },
    update: {
      U_PasswordHash: hashedPassword,
      U_Role: 'SUPER_ADMIN' as any,
      U_IsActive: true,
      U_SiteId: site.S_Id, // On s'assure qu'il est lié au bon site
    },
    create: {
      U_Email: 'ab.thiongane@qualisoft.sn',
      U_PasswordHash: hashedPassword,
      U_FirstName: 'Abdoulaye',
      U_LastName: 'Thiongane',
      U_Role: 'SUPER_ADMIN',
      U_IsActive: true,
      U_FirstLogin: false,
      tenantId: tenant.T_Id,
      U_SiteId: site.S_Id,
    },
  });
  
  console.log('--------------------------------------------------------');
  console.log(`👑 COMPTE ÉTERNEL CRÉÉ AVEC SUCCÈS`);
  console.log(`📧 Email : ${user.U_Email}`);
  console.log(`🔐 Pass   : ${passwordEternel}`);
  console.log('--------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erreur critique lors du Seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });