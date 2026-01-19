import { PrismaClient, Role, Plan, SubscriptionStatus, GovernanceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  Initialisation du Noyau Qualisoft RD 2030...');

  const masterEmail = 'ab.thiongane@qualisoft.sn';
  const hashedPassword = await bcrypt.hash('mohamed1965ab1711@', 10);

  // 1. GARANTIE DU TENANT MASTER
  const tenant = await prisma.tenant.upsert({
    where: { T_Email: masterEmail },
    update: { T_Name: 'QUALISOFT CORPORATE', T_Plan: Plan.GROUPE },
    create: {
      T_Name: 'QUALISOFT CORPORATE',
      T_Email: masterEmail,
      T_Domain: 'qualisoft.sn',
      T_Plan: Plan.GROUPE,
      T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
      T_IsActive: true,
      T_ContractDuration: 99,
    },
  });

  // 2. GARANTIE DE L'ADMINISTRATEUR MAÎTRE
  const masterUser = await prisma.user.upsert({
    where: { U_Email: masterEmail },
    update: { U_Role: Role.ADMIN },
    create: {
      U_FirstName: 'Abdoulaye',
      U_LastName: 'THIONGANE',
      U_Email: masterEmail,
      U_PasswordHash: hashedPassword,
      U_Role: Role.ADMIN,
      tenantId: tenant.T_Id,
    },
  });

  // 3. SITE DE RÉFÉRENCE
  const site = await prisma.site.upsert({
    where: { S_Id: 'SITE-HQ-DAKAR' },
    update: {},
    create: {
      S_Id: 'SITE-HQ-DAKAR',
      S_Name: 'Siège Social - Dakar',
      S_Address: 'Avenue Cheikh Anta Diop',
      tenantId: tenant.T_Id,
    },
  });

  // 4. TYPES DE PROCESSUS
  const types = [
    { id: 'TYPE-PIL', label: 'PILOTAGE' },
    { id: 'TYPE-REA', label: 'REALISATION' },
    { id: 'TYPE-SUP', label: 'SUPPORT' },
  ];

  for (const t of types) {
    await prisma.processType.upsert({
      where: { PT_Id: t.id },
      update: { PT_Label: t.label },
      create: {
        PT_Id: t.id,
        PT_Label: t.label,
        tenantId: tenant.T_Id,
      },
    });
  }

  // 5. LES 12 PROCESSUS MÉTIERS
  const processes = [
    { code: 'PR-MAN', label: 'Management & Stratégie', typeId: 'TYPE-PIL' },
    { code: 'PR-QSE', label: 'Qualité Sécurité Environnement', typeId: 'TYPE-PIL' },
    { code: 'PR-COM', label: 'Commercial & Ventes', typeId: 'TYPE-REA' },
    { code: 'PR-PROD', label: 'Production / Prestation', typeId: 'TYPE-REA' },
    { code: 'PR-LOG', label: 'Logistique & Transport', typeId: 'TYPE-REA' },
    { code: 'PR-ACH', label: 'Achats & Fournisseurs', typeId: 'TYPE-SUP' },
    { code: 'PR-RH', label: 'Ressources Humaines', typeId: 'TYPE-SUP' },
    { code: 'PR-FIN', label: 'Finance & Comptabilité', typeId: 'TYPE-SUP' },
    { code: 'PR-MAINT', label: 'Maintenance & Infra', typeId: 'TYPE-SUP' },
    { code: 'PR-SI', label: 'Système d Information', typeId: 'TYPE-SUP' },
    { code: 'PR-JUR', label: 'Juridique & Conformité', typeId: 'TYPE-SUP' },
    { code: 'PR-COMMS', label: 'Communication', typeId: 'TYPE-SUP' },
  ];

  console.log('⚙️  Génération des 12 processus métiers...');
  for (const p of processes) {
    await prisma.processus.upsert({
      where: { PR_Code_tenantId: { PR_Code: p.code, tenantId: tenant.T_Id } },
      update: { PR_Libelle: p.label },
      create: {
        PR_Code: p.code,
        PR_Libelle: p.label,
        PR_TypeId: p.typeId,
        PR_PiloteId: masterUser.U_Id, // Affecté à l'admin par défaut pour le démarrage
        tenantId: tenant.T_Id,
      },
    });
  }

  // 6. INDICATEURS DE PERFORMANCE QHSE
  // Note : On récupère l'ID du processus QSE pour lier les indicateurs
  const qseProc = await prisma.processus.findFirst({ where: { PR_Code: 'PR-QSE', tenantId: tenant.T_Id } });

  if (qseProc) {
    const indicators = [
      { code: 'IND-QUAL-01', label: 'Taux de conformité Audits', unit: '%', cible: 95 },
      { code: 'IND-ENV-01', label: 'Consommation Électrique', unit: 'kWh', cible: 1200 },
    ];

    for (const ind of indicators) {
      await prisma.indicator.upsert({
        where: { IND_Id: `ID-${ind.code}` }, // Utilisation d'un ID fixe pour le seed
        update: { IND_Cible: ind.cible },
        create: {
          IND_Id: `ID-${ind.code}`,
          IND_Code: ind.code,
          IND_Libelle: ind.label,
          IND_Unite: ind.unit,
          IND_Cible: ind.cible,
          IND_ProcessusId: qseProc.PR_Id,
          tenantId: tenant.T_Id,
        },
      });
    }
  }

  console.log('✅ SEED TERMINÉ : Système prêt pour le 02/02/2026');
}

main()
  .catch((e) => {
    console.error('❌ Erreur Critique Seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });