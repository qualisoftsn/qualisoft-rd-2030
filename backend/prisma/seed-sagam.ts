import { Plan, PrismaClient, Role, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedSagam() {
  console.log('--- 🚀 DÉPLOIEMENT ÉLITE : SAGAM ELECTRONICS ---');

  // Utilisation d'un sel de 10 pour le hashage (standard)
  const hashedPwd = await bcrypt.hash('sagam@2026', 10);

  // 1. CRÉATION DU TENANT (L'ORGANISATION)
  const sagam = await prisma.tenant.upsert({
    where: { T_Email: 'sagam@sagam.sn' },
    update: {
      T_Name: 'SAGAM ELECTRONICS',
      T_Plan: Plan.ENTREPRISE,
      T_SubscriptionStatus: SubscriptionStatus.TRIAL,
      T_SubscriptionEndDate: new Date('2026-01-27T23:59:59Z'),
    },
    create: {
      T_Name: 'SAGAM ELECTRONICS',
      T_Email: 'sagam@sagam.sn',
      T_Domain: 'sagam.sn',
      T_Plan: Plan.ENTREPRISE,
      T_SubscriptionStatus: SubscriptionStatus.TRIAL,
      T_SubscriptionEndDate: new Date('2026-01-27T23:59:59Z'),
      T_CeoName: 'Directeur Général SAGAM',
    },
  });

  const tId = sagam.T_Id;

  // 2. CRÉATION DU SITE (Obligatoire pour lier les utilisateurs)
  // On utilise upsert pour le site aussi pour éviter les doublons au nom
  const mainSite = await prisma.site.upsert({
    where: { S_Id: 'sagam-main-site-id' }, // ID fixe pour le seed
    update: { S_Name: 'Siège Social Dakar' },
    create: {
      S_Id: 'sagam-main-site-id',
      S_Name: 'Siège Social Dakar',
      S_Address: 'Zone Industrielle, Dakar',
      tenantId: tId,
    }
  });

  // 3. CRÉATION DES UTILISATEURS (Pilotes & Staff)
  const usersToCreate = [
    { email: 'sagam@sagam.sn', first: 'PIERRE', last: 'NDIAYE', role: Role.ADMIN },
    { email: 'm.diouf@sagam.sn', first: 'MARGUERITE', last: 'DIOUF', role: Role.USER },
    { email: 'omar.mbengue@sagam.sn', first: 'OMAR', last: 'MBENGUE', role: Role.PILOTE },
    { email: 'thierno.ndiaye@sagam.sn', first: 'THIERNO', last: 'NDIAYE', role: Role.PILOTE },
    { email: 'lamine.dieng@sagam.sn', first: 'LAMINE', last: 'DIENG', role: Role.PILOTE },
    { email: 'besset.thiam@sagam.sn', first: 'BESSET', last: 'THIAM', role: Role.PILOTE },
    { email: 'amadou.dem@sagam.sn', first: 'AMADOU', last: 'DEM', role: Role.PILOTE },
    { email: 'oumar.ouattara@sagam.sn', first: 'OUMAR', last: 'OUATTARA', role: Role.PILOTE },
    { email: 'lamine.sao@sagam.sn', first: 'LAMINE', last: 'SAO', role: Role.PILOTE },
    { email: 'hawa.ndiaye@sagam.sn', first: 'HAWA', last: 'NDIAYE', role: Role.PILOTE },
  ];

  const userMap = new Map();

  console.log('👥 Synchronisation des utilisateurs...');

  for (const u of usersToCreate) {
    const created = await prisma.user.upsert({
      where: { U_Email: u.email },
      update: {
        U_FirstName: u.first,
        U_LastName: u.last,
        U_PasswordHash: hashedPwd, // On force la mise à jour du mot de passe
        U_Role: u.role,
        U_IsActive: true,
      },
      create: {
        U_Email: u.email,
        U_PasswordHash: hashedPwd,
        U_FirstName: u.first,
        U_LastName: u.last,
        U_Role: u.role,
        tenantId: tId,
        U_SiteId: mainSite.S_Id,
        U_IsActive: true,
      }
    });
    // On stocke l'ID pour les relations Processus
    userMap.set(`${u.first} ${u.last}`, created.U_Id);
  }

  // 4. TYPES DE PROCESSUS
  const pType = await prisma.processType.upsert({
    where: { PT_Label_tenantId: { PT_Label: 'Métier', tenantId: tId } },
    update: {},
    create: { PT_Label: 'Métier', PT_Description: 'Processus opérationnels', tenantId: tId }
  });

  // 5. TYPES DE RISQUES
  const rType = await prisma.riskType.upsert({
    where: { RT_Label_tenantId: { RT_Label: 'Opérationnel', tenantId: tId } },
    update: {},
    create: { RT_Label: 'Opérationnel', tenantId: tId }
  });

  // 6. NETTOYAGE DES ANCIENS PROCESSUS POUR SAGAM (Evite les doublons de code)
  await prisma.processus.deleteMany({ where: { tenantId: tId } });

  // 7. INJECTION DES 8 PROCESSUS + KPI + RISQUES
  const processes = [
    { code: 'PSMQ', lib: 'Pilotage Qualité', pilot: 'PIERRE NDIAYE', kpi: 'Taux conformité', target: 95, risk: 'Ecart stratégique' },
    { code: 'IT', lib: 'Système IT', pilot: 'THIERNO NDIAYE', kpi: 'Uptime Serveurs', target: 99.9, risk: 'Cyber-attaque' },
    { code: 'DCM', lib: 'Commercial & Marketing', pilot: 'OMAR MBENGUE', kpi: 'Transformation', target: 15, risk: 'Perte Client' },
    { code: 'DE', lib: 'Etudes', pilot: 'BESSET THIAM', kpi: 'Délais Projets', target: 90, risk: 'Erreur Conception' },
    { code: 'DO', lib: 'Opérations', pilot: 'AMADOU DEM', kpi: 'Taux Rebuts', target: 1.5, risk: 'Panne Machine' },
    { code: 'DFC', lib: 'Finances', pilot: 'LAMINE DIENG', kpi: 'DSO', target: 45, risk: 'Crise Trésorerie' },
    { code: 'RH', lib: 'Ressources Humaines', pilot: 'HAWA NDIAYE', kpi: 'Turnover', target: 5, risk: 'Grève / Climat social' },
    { code: 'AA', lib: 'Appro & Achat', pilot: 'LAMINE SAO', kpi: 'Qualité Fournisseur', target: 98, risk: 'Rupture Stock' },
  ];

  console.log('⚙️ Configuration de la cartographie des processus...');

  for (const p of processes) {
    const pilotId = userMap.get(p.pilot);
    if (!pilotId) {
        console.warn(`⚠️ Pilote non trouvé pour le processus ${p.code}: ${p.pilot}`);
        continue;
    }

    await prisma.processus.create({
      data: {
        PR_Code: p.code,
        PR_Libelle: p.lib,
        PR_TypeId: pType.PT_Id,
        PR_PiloteId: pilotId,
        tenantId: tId,
        PR_Indicators: {
          create: {
            IND_Code: `KPI-${p.code}`,
            IND_Libelle: p.kpi,
            IND_Unite: '%',
            IND_Cible: p.target,
            tenantId: tId,
            IND_Values: {
              create: { IV_Month: 1, IV_Year: 2026, IV_Actual: p.target * 0.95 }
            }
          }
        },
        PR_Risks: {
          create: {
            RS_Libelle: p.risk,
            RS_TypeId: rType.RT_Id,
            RS_Probabilite: 2,
            RS_Gravite: 4,
            RS_Score: 8,
            tenantId: tId
          }
        }
      }
    });
  }

  console.log('--- ✅ SAGAM ELECTRONICS : SYSTÈME PRÊT ---');
  console.log('Admin : sagam@sagam.sn / sagam@2026');
}