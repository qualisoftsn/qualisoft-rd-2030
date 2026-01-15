import { PrismaClient, Role, Plan } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Restauration des accès Qualisoft en cours...');
  
  const passwordHash = await bcrypt.hash('qualisoft@1711', 10);

  // 1. Création ou Récupération du Tenant Qualisoft
  const tenant = await prisma.tenant.upsert({
    where: { T_Email: 'ab.thiongane@qualisoft.sn' },
    update: { T_Plan: Plan.GROUPE },
    create: {
      T_Name: 'QUALISOFT',
      T_Email: 'ab.thiongane@qualisoft.sn',
      T_Domain: 'qualisoft.sn',
      T_Plan: Plan.GROUPE,
    },
  });

  // 2. Création des Types (Paramétrage CRUD obligatoire)
  // On utilise upsert pour ne pas planter si les types existent déjà
  const typeDirection = await prisma.orgUnitType.upsert({
    where: { OUT_Label_tenantId: { OUT_Label: 'DIRECTION', tenantId: tenant.T_Id } },
    update: {},
    create: {
      OUT_Label: 'DIRECTION',
      OUT_Description: 'Direction de haut niveau',
      tenantId: tenant.T_Id
    }
  });

  // 3. Création du Site MERMOZ
  const site = await prisma.site.create({
    data: {
      S_Name: 'MERMOZ',
      S_Address: 'Dakar, Sénégal',
      tenantId: tenant.T_Id
    }
  });

  // 4. Création de l'Unité (OrgUnit) avec liaison par ID
 // 4. Création de l'Unité (OrgUnit) 
  // On utilise OU_TypeId pour être direct
  const unit = await prisma.orgUnit.create({
    data: {
      OU_Name: 'DIRECTION GÉNÉRALE',
      OU_SiteId: site.S_Id,
      tenantId: tenant.T_Id,
      OU_TypeId: typeDirection.OUT_Id, // 👈 Utilisation de l'ID direct au lieu de connect
      OU_IsActive: true
    }
  });

  // 5. Restauration de tes accès (Admin & RQ)
  const usersToCreate = [
    { email: 'ab.thiongane@qualisoft.sn', firstName: 'Abdoulaye', lastName: 'THIONGANE', role: Role.SUPER_ADMIN },
    { email: 'rq@tech.sn', firstName: 'Responsable', lastName: 'QUALITÉ', role: Role.ADMIN }
  ];

  for (const user of usersToCreate) {
    await prisma.user.upsert({
      where: { U_Email: user.email },
      update: { 
        U_PasswordHash: passwordHash,
        U_OrgUnitId: unit.OU_Id,
        U_SiteId: site.S_Id
      },
      create: {
        U_Email: user.email,
        U_PasswordHash: passwordHash,
        U_FirstName: user.firstName,
        U_LastName: user.lastName,
        U_Role: user.role,
        tenantId: tenant.T_Id,
        U_SiteId: site.S_Id,
        U_OrgUnitId: unit.OU_Id,
      },
    });
  }

  console.log('---');
  console.log('✅ ACCÈS RESTAURÉS POUR QUALISOFT ELITE');
  console.log(`Utilisateur : ${usersToCreate[0].email}`);
  console.log('Mot de passe : qualisoft@1711');
  console.log('---');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du reset :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });