import { PrismaClient, Role, Plan, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🛡️  INITIALISATION DU NOYAU QUALISOFT RD 2030...');

  // 1. CONFIGURATION DU COMPTE ÉTERNEL
  const masterEmail = 'ab.thiongane@qualisoft.sn';
  const hashedPassword = await bcrypt.hash('mohamed1965ab1711@', 10);

  // 2. DÉFINITION DES TROIS TENANTS MAJEURS
  const tenantsData = [
    {
      id: 'TENANT-QUALI-CORP',
      name: 'QUALISOFT CORPORATE',
      email: masterEmail,
      domain: 'qualisoft.sn',
      plan: Plan.GROUPE,
    },
    {
      id: 'TENANT-SENELEC',
      name: 'SENELEC',
      email: 'contact@senelec.sn',
      domain: 'senelec.sn',
      plan: Plan.ENTREPRISE,
    },
    {
      id: 'TENANT-PAD',
      name: 'PORT AUTONOME DE DAKAR',
      email: 'info@portdakar.sn',
      domain: 'portdakar.sn',
      plan: Plan.ENTREPRISE,
    }
  ];

  for (const tData of tenantsData) {
    console.log(`\n building 🏗️  Structure pour : ${tData.name}...`);

    // A. GARANTIE DU TENANT
    const tenant = await prisma.tenant.upsert({
      where: { T_Domain: tData.domain },
      update: { T_Name: tData.name, T_Plan: tData.plan },
      create: {
        T_Id: tData.id,
        T_Name: tData.name,
        T_Email: tData.email,
        T_Domain: tData.domain,
        T_Plan: tData.plan,
        T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
        T_IsActive: true,
        T_ContractDuration: 99,
      },
    });

    // B. GARANTIE DE L'UTILISATEUR MAÎTRE (Lié au Tenant Corporate)
    // Le compte éternel est créé une seule fois et rattaché à Qualisoft
    let currentUser;
    if (tData.id === 'TENANT-QUALI-CORP') {
      currentUser = await prisma.user.upsert({
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
    } else {
      // Pour Senelec et PAD, on crée un admin par défaut
      currentUser = await prisma.user.upsert({
        where: { U_Email: `admin@${tData.domain}` },
        update: {},
        create: {
          U_FirstName: 'Admin',
          U_LastName: tData.name,
          U_Email: `admin@${tData.domain}`,
          U_PasswordHash: hashedPassword,
          U_Role: Role.ADMIN,
          tenantId: tenant.T_Id,
        },
      });
    }

    // C. SITE DE RÉFÉRENCE PAR TENANT
    const siteId = `SITE-HQ-${tData.id}`;
    await prisma.site.upsert({
      where: { S_Id: siteId },
      update: {},
      create: {
        S_Id: siteId,
        S_Name: `Siège Social - ${tData.name}`,
        S_Address: tData.id === 'TENANT-QUALI-CORP' ? 'Avenue Cheikh Anta Diop' : 'Dakar, Sénégal',
        tenantId: tenant.T_Id,
      },
    });

    // D. TYPES DE PROCESSUS (PILOTAGE, REALISATION, SUPPORT)
    const types = [
      { id: `TYPE-PIL-${tData.id}`, label: 'PILOTAGE' },
      { id: `TYPE-REA-${tData.id}`, label: 'REALISATION' },
      { id: `TYPE-SUP-${tData.id}`, label: 'SUPPORT' },
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

    // E. LES 12 PROCESSUS MÉTIERS NORMATIFS
    const processes = [
      { code: 'PR-MAN', label: 'Management & Stratégie', typeId: `TYPE-PIL-${tData.id}` },
      { code: 'PR-QSE', label: 'Qualité Sécurité Environnement', typeId: `TYPE-PIL-${tData.id}` },
      { code: 'PR-COM', label: 'Commercial & Ventes', typeId: `TYPE-REA-${tData.id}` },
      { code: 'PR-PROD', label: 'Production / Prestation', typeId: `TYPE-REA-${tData.id}` },
      { code: 'PR-LOG', label: 'Logistique & Transport', typeId: `TYPE-REA-${tData.id}` },
      { code: 'PR-ACH', label: 'Achats & Fournisseurs', typeId: `TYPE-SUP-${tData.id}` },
      { code: 'PR-RH', label: 'Ressources Humaines', typeId: `TYPE-SUP-${tData.id}` },
      { code: 'PR-FIN', label: 'Finance & Comptabilité', typeId: `TYPE-SUP-${tData.id}` },
      { code: 'PR-MAINT', label: 'Maintenance & Infra', typeId: `TYPE-SUP-${tData.id}` },
      { code: 'PR-SI', label: 'Système d Information', typeId: `TYPE-SUP-${tData.id}` },
      { code: 'PR-JUR', label: 'Juridique & Conformité', typeId: `TYPE-SUP-${tData.id}` },
      { code: 'PR-COMMS', label: 'Communication', typeId: `TYPE-SUP-${tData.id}` },
    ];

    for (const p of processes) {
      await prisma.processus.upsert({
        where: { PR_Code_tenantId: { PR_Code: p.code, tenantId: tenant.T_Id } },
        update: { PR_Libelle: p.label },
        create: {
          PR_Code: p.code,
          PR_Libelle: p.label,
          PR_TypeId: p.typeId,
          PR_PiloteId: currentUser.U_Id,
          tenantId: tenant.T_Id,
        },
      });
    }

    // F. INDICATEURS DE PERFORMANCE QHSE
    const qseProc = await prisma.processus.findFirst({ 
      where: { PR_Code: 'PR-QSE', tenantId: tenant.T_Id } 
    });

    if (qseProc) {
      const indicators = [
        { code: 'IND-QUAL-01', label: 'Taux de conformité Audits', unit: '%', cible: 95 },
        { code: 'IND-ENV-01', label: 'Consommation Électrique', unit: 'kWh', cible: 1200 },
      ];

      for (const ind of indicators) {
        await prisma.indicator.upsert({
          where: { IND_Code_tenantId: { IND_Code: ind.code, tenantId: tenant.T_Id } },
          update: { IND_Cible: ind.cible },
          create: {
            IND_Id: `ID-${ind.code}-${tData.id}`,
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
  }

  console.log('\n✅ SEED TERMINÉ : Multi-Tenancy (Qualisoft, Senelec, PAD) opérationnel.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur Critique Seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });