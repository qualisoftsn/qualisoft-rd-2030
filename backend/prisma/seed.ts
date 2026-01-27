import { 
  PrismaClient, Role, SubscriptionStatus, Plan, Site, User, 
  ActionOrigin, ActionType, ActionStatus, Priority, SSEType, 
  AuditStatus, FindingType, NCSource, DocCategory, DocStatus,
  TierType, GovernanceType, ActivityStatus, Processus, Indicator,
  Plan as PrismaPlan
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🏁 Démarrage du Seed Master Qualisoft (Version Blindée 16:45)...');
  const passwordEternel = 'mohamed1965ab1711@';
  const hashedPassword = await bcrypt.hash(passwordEternel, 10);

  // --- 1. COMPTE ÉTERNEL & TENANT MAÎTRE ---
  const masterTenant = await prisma.tenant.upsert({
    where: { T_Id: 'QS-2026-JANV' },
    update: { T_Name: 'Qualisoft', T_IsActive: true, T_Plan: PrismaPlan.GROUPE },
    create: {
      T_Id: 'QS-2026-JANV', T_Name: 'Qualisoft', T_Email: 'qualisoft@qualisoft.sn',
      T_Domain: 'qualisoft', T_Plan: PrismaPlan.GROUPE, T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
      T_IsActive: true, T_CeoName: 'Abdoulaye THIONGANE'
    },
  });

  const masterSite = await prisma.site.upsert({
    where: { S_Id: 'SITE-QS-MASTER' },
    update: {},
    create: { S_Id: 'SITE-QS-MASTER', S_Name: 'Siège Social Qualisoft', tenantId: masterTenant.T_Id },
  });

  await prisma.user.upsert({
    where: { U_Email: 'ab.thiongane@qualisoft.sn' },
    update: { U_PasswordHash: hashedPassword, U_Role: Role.SUPER_ADMIN },
    create: {
      U_Email: 'ab.thiongane@qualisoft.sn', U_PasswordHash: hashedPassword,
      U_FirstName: 'Abdoulaye', U_LastName: 'Thiongane', U_Role: Role.SUPER_ADMIN,
      U_IsActive: true, U_FirstLogin: false, tenantId: masterTenant.T_Id, U_SiteId: masterSite.S_Id,
    },
  });

  // --- 2. CONFIGURATION DES 5 TENANTS ---
  const tenantsConfig = [
    { id: 'TEN-INFRA-001', name: 'Global Infra Sénégal', domain: 'global-infra', plan: PrismaPlan.ENTREPRISE },
    { id: 'TEN-MED-002', name: 'BioSanté Lab', domain: 'biosante', plan: PrismaPlan.CROISSANCE },
    { id: 'TEN-ENER-003', name: 'Sahel Solar', domain: 'sahel-solar', plan: PrismaPlan.EMERGENCE },
    { id: 'TEN-AGRO-004', name: 'AgroPlus SN', domain: 'agroplus', plan: PrismaPlan.ENTREPRISE },
    { id: masterTenant.T_Id, name: masterTenant.T_Name, domain: masterTenant.T_Domain, plan: masterTenant.T_Plan }
  ];

  for (const t of tenantsConfig) {
    const tenant = await prisma.tenant.upsert({
      where: { T_Domain: t.domain },
      update: { T_SubscriptionStatus: SubscriptionStatus.ACTIVE },
      create: { 
        T_Id: t.id, T_Name: t.name, T_Email: `contact@${t.domain}.sn`, 
        T_Domain: t.domain, T_Plan: t.plan, T_SubscriptionStatus: SubscriptionStatus.ACTIVE 
      }
    });

    const outType = await prisma.orgUnitType.upsert({
      where: { OUT_Label_tenantId: { OUT_Label: 'Département', tenantId: tenant.T_Id } },
      update: {},
      create: { OUT_Label: 'Département', tenantId: tenant.T_Id }
    });

    const prType = await prisma.processType.upsert({
      where: { PT_Label_tenantId: { PT_Label: 'Métier', tenantId: tenant.T_Id } },
      update: {},
      create: { PT_Label: 'Métier', tenantId: tenant.T_Id }
    });

    const riskType = await prisma.riskType.upsert({
      where: { RT_Label_tenantId: { RT_Label: 'Opérationnel', tenantId: tenant.T_Id } },
      update: {},
      create: { RT_Label: 'Opérationnel', tenantId: tenant.T_Id }
    });

    const site = await prisma.site.upsert({
      where: { S_Id: `SITE-${t.id}` },
      update: {},
      create: { S_Id: `SITE-${t.id}`, S_Name: `Site Principal ${t.name}`, tenantId: tenant.T_Id }
    });

    const users: User[] = [];
    for (let i = 1; i <= 4; i++) {
      const email = `user${i}@${t.domain}.sn`.toLowerCase();
      const u = await prisma.user.upsert({
        where: { U_Email: email },
        update: { U_PasswordHash: hashedPassword },
        create: {
          U_Email: email, U_PasswordHash: hashedPassword, U_FirstName: `Prénom${i}`,
          U_LastName: t.name, U_Role: i === 1 ? Role.ADMIN : Role.USER,
          tenantId: tenant.T_Id, U_SiteId: site.S_Id, U_FirstLogin: false
        }
      });
      users.push(u);
    }

    for (let i = 0; i < 3; i++) {
      const pCode = `PR-${t.domain.toUpperCase()}-${i}`;
      const proc = await prisma.processus.upsert({
        where: { PR_Code_tenantId: { PR_Code: pCode, tenantId: tenant.T_Id } },
        update: {},
        create: { PR_Code: pCode, PR_Libelle: `Processus ${i}`, PR_TypeId: prType.PT_Id, PR_PiloteId: users[0].U_Id, tenantId: tenant.T_Id }
      });

      for (let j = 1; j <= 5; j++) {
        const indCode = `IND-${pCode}-${j}`;
        await prisma.indicator.upsert({
          where: { IND_Code_tenantId: { IND_Code: indCode, tenantId: tenant.T_Id } },
          update: {},
          create: {
            IND_Code: indCode, IND_Libelle: `KPI ${j}`, IND_Unite: '%', IND_Cible: 90,
            IND_ProcessusId: proc.PR_Id, tenantId: tenant.T_Id,
            IND_Values: { create: { IV_Month: 1, IV_Year: 2026, IV_Actual: Math.random() * 100, IV_Status: 'VALIDE' } }
          }
        });
      }

      if (i === 0) {
        const paq = await prisma.pAQ.upsert({
          where: { PAQ_ProcessusId_PAQ_Year_tenantId: { PAQ_ProcessusId: proc.PR_Id, PAQ_Year: 2026, tenantId: tenant.T_Id } },
          update: {},
          create: { PAQ_Title: `PAQ 2026 ${t.name}`, PAQ_Year: 2026, PAQ_ProcessusId: proc.PR_Id, PAQ_QualityManagerId: users[0].U_Id, tenantId: tenant.T_Id }
        });

        // 🛡️ Correction Actions : on vérifie si elles existent (basé sur le titre pour le seed)
        for (let k = 1; k <= 10; k++) {
          await prisma.action.create({
            data: { 
              ACT_Title: `Action ${k} - ${t.name}`, ACT_PAQId: paq.PAQ_Id, ACT_ResponsableId: users[0].U_Id, 
              ACT_CreatorId: users[0].U_Id, tenantId: tenant.T_Id, ACT_Status: ActionStatus.EN_COURS 
            }
          });
        }
      }
    }

    // 🛡️ CORRECTION FINALE : Upsert pour Equipments, Tiers, Risks, Documents
    for (let i = 1; i <= 10; i++) {
      if (i <= 5) {
        const eqRef = `EQ-${t.id}-${i}`;
        await prisma.equipment.upsert({
          where: { EQ_Reference: eqRef },
          update: { EQ_Name: `Matériel ${i}` },
          create: { EQ_Reference: eqRef, EQ_Name: `Matériel ${i}`, EQ_DateService: new Date(), EQ_ProchaineVGP: new Date(), tenantId: tenant.T_Id }
        });
      }
      
      if (i <= 8) {
        await prisma.tier.create({ // On peut laisser create ici car TR_Id est un UUID généré
          data: { TR_Name: `Tier ${i} ${t.name}`, TR_Type: TierType.CLIENT, tenantId: tenant.T_Id }
        });
      }

      await prisma.document.create({
        data: { DOC_Title: `Document ${i}`, DOC_Category: DocCategory.PROCEDURE, DOC_Status: DocStatus.APPROUVE, tenantId: tenant.T_Id }
      });
    }

    // 🛡️ Correction Audits : Upsert sur AU_Reference
    for (let i = 1; i <= 3; i++) {
      const auRef = `AU-${t.id}-${i}`;
      await prisma.audit.upsert({
        where: { AU_Reference: auRef },
        update: { AU_Title: `Audit Externe ${i}` },
        create: {
          AU_Reference: auRef, AU_Title: `Audit Externe ${i}`, AU_Scope: 'Périmètre Global',
          AU_DateAudit: new Date(), AU_SiteId: site.S_Id, tenantId: tenant.T_Id, AU_Status: AuditStatus.PLANIFIE
        }
      });
    }

    console.log(`✅ Simulation terminée pour : ${t.name}`);
  }
  console.log('🚀 SEED MASTER RÉUSSI !');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());