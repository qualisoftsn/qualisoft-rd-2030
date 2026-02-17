/**
 * 🛰️ PROTOCOLE DE SCELLAGE MASTER - QUALISOFT ELITE RD 2030
 * VERSION : 7.0.0 (Isolation Totale)
 * RÔLE : Nettoyage atomique de la base et reconstruction des 3 Nœuds.
 * SÉCURITÉ : Hachage Bcrypt Round 12 + Isolation stricte par TenantID.
 */

import { PrismaClient, Plan, SubscriptionStatus, Role, ProcessFamily } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterSystem(): Promise<void> {
  console.log('--------------------------------------------------------');
  console.log('🧹 NETTOYAGE ATOMIQUE : SUPPRESSION DE TOUTES LES DONNÉES...');
  console.log('--------------------------------------------------------');

  // Purge radicale pour éviter les collisions de tenants
  await prisma.user.deleteMany();
  await prisma.processus.deleteMany();
  await prisma.processType.deleteMany();
  await prisma.orgUnit.deleteMany();
  await prisma.orgUnitType.deleteMany();
  await prisma.site.deleteMany();
  await prisma.tenant.deleteMany();

  console.log('✨ BASE PURGÉE. DÉPLOIEMENT DES 3 PILIERS ISOLÉS...');

  const SALT = 12;

  // --- CONFIGURATION DES 3 UNITÉS DE LA FÉDÉRATION ---
  const tenantsData = [
    {
      id: 'TENANT_QS_CORP',
      name: 'QUALISOFT CORPORATE',
      domain: 'qs.qualisoft.sn',
      ceo: 'Abdoulaye Thiongane',
      email: 'ab.thiongane@qualisoft.sn',
      address: '247, Rue du Lac Rose, Dakar, Sénégal',
      phone: '77441 09 02',
      plan: Plan.GROUPE,
      admin: {
        firstName: 'Abdoulaye',
        lastName: 'THIONGANE',
        email: 'ab.thiongane@qualisoft.sn',
        password: 'mohamed1965ab1711@@@', // Compte Éternel
        role: Role.SUPER_ADMIN
      }
    },
    {
      id: 'TENANT_PAD',
      name: 'PORT AUTONOME DE DAKAR',
      domain: 'pad.qualisoft.sn',
      ceo: 'Waly Diouf Bodian',
      email: 'ale.diagne@pad.sn',
      address: 'Rue 1, Mole 2 Port de Dakar, Dakar - Sénégal',
      phone: '221 865 15 15',
      plan: Plan.ENTREPRISE,
      admin: {
        firstName: 'Ale',
        lastName: 'DIAGNE',
        email: 'ale.diagne@pad.sn',
        password: 'pad@2026',
        role: Role.ADMIN
      }
    },
    {
      id: 'TENANT_SAGAM',
      name: 'SAGAM ELECTRONICS',
      domain: 'sagam.qualisoft.sn',
      ceo: 'Faly SENE',
      email: 'pierre.ndiaye@sagam.sn',
      address: 'Rue 3, Sotrac Mermoz, Dakar, Sénégal',
      phone: '221 865 65 65',
      plan: Plan.ENTREPRISE,
      admin: {
        firstName: 'Pierre',
        lastName: 'Ndiaye',
        email: 'pierre.ndiaye@sagam.sn',
        password: 'sagam@2026',
        role: Role.ADMIN
      }
    }
  ];

  try {
    for (const t of tenantsData) {
      console.log(`📡 SCELLAGE DU NŒUD : ${t.domain}...`);

      // 1. CRÉATION DU TENANT (Isolation ID forcée)
      const currentTenant = await prisma.tenant.create({
        data: {
          T_Id: t.id,
          T_Name: t.name,
          T_Email: t.email,
          T_Domain: t.domain,
          T_CeoName: t.ceo,
          T_Address: t.address,
          T_Phone: t.phone,
          T_Plan: t.plan,
          T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
          T_IsActive: true,
          T_ContractDuration: 99,
        },
      });

      // 2. CRÉATION DU SITE SIÈGE (Liaison au currentTenant)
      const currentSite = await prisma.site.create({
        data: {
          S_Id: `SITE_${t.id}`,
          S_Name: 'SIÈGE SOCIAL',
          S_Address: t.address,
          S_Country: 'Sénégal',
          tenantId: currentTenant.T_Id,
        },
      });

      // 3. TYPES D'UNITÉS (Liaison au currentTenant)
      const dirType = await prisma.orgUnitType.create({
        data: { OUT_Id: `OUT_DIR_${t.id}`, OUT_Label: 'DIRECTION', tenantId: currentTenant.T_Id }
      });
      await prisma.orgUnitType.create({
        data: { OUT_Id: `OUT_DEP_${t.id}`, OUT_Label: 'DÉPARTEMENT', tenantId: currentTenant.T_Id }
      });

      // 4. UNITÉ ORGANIQUE RACINE (Liaison au currentTenant + currentSite)
      const rootUnit = await prisma.orgUnit.create({
        data: {
          OU_Id: `OU_DG_${t.id}`,
          OU_Name: 'DIRECTION GÉNÉRALE',
          OU_TypeId: dirType.OUT_Id,
          OU_SiteId: currentSite.S_Id,
          tenantId: currentTenant.T_Id,
        },
      });

      // 5. TYPES DE PROCESSUS ISO (Liaison au currentTenant)
      const pilotageType = await prisma.processType.create({
        data: {
          PT_Id: `PT_PIL_${t.id}`,
          PT_Label: 'PILOTAGE',
          PT_Family: ProcessFamily.PILOTAGE,
          PT_Color: '#3B82F6',
          tenantId: currentTenant.T_Id,
        }
      });

      const supportType = await prisma.processType.create({
        data: {
          PT_Id: `PT_SUP_${t.id}`,
          PT_Label: 'SUPPORT',
          PT_Family: ProcessFamily.SUPPORT,
          PT_Color: '#64748B',
          tenantId: currentTenant.T_Id,
        }
      });

      // 6. 🛡️ CRÉATION DE L'ADMINISTRATEUR (Hashage Bcrypt 12)
      // On s'assure que chaque admin est lié EXCLUSIVEMENT à son currentTenant
      const hashedPassword = await bcrypt.hash(t.admin.password, SALT);
      const adminUser = await prisma.user.create({
        data: {
          U_Id: `USER_ADMIN_${t.id}`,
          U_FirstName: t.admin.firstName,
          U_LastName: t.admin.lastName.toUpperCase(),
          U_Email: t.admin.email,
          U_PasswordHash: hashedPassword,
          U_Role: t.admin.role,
          U_IsActive: true,
          U_FirstLogin: false,
          tenantId: currentTenant.T_Id,
          U_SiteId: currentSite.S_Id,
          U_OrgUnitId: rootUnit.OU_Id,
        },
      });

      // 7. PROCESSUS STANDARDS (Liaison au currentTenant + adminUser Pilote)
      const procs = [
        { id: `PR_SMI_${t.id}`, code: 'PR-SMI', libelle: 'Amélioration Continue', typeId: pilotageType.PT_Id },
        { id: `PR_RH_${t.id}`, code: 'PR-RH', libelle: 'Ressources Humaines', typeId: supportType.PT_Id },
      ];

      for (const p of procs) {
        await prisma.processus.create({
          data: {
            PR_Id: p.id,
            PR_Code: p.code,
            PR_Libelle: p.libelle,
            PR_TypeId: p.typeId,
            PR_PiloteId: adminUser.U_Id,
            tenantId: currentTenant.T_Id,
          }
        });
      }

      console.log(`✅ NŒUD SCELLÉ ET ISOLÉ : ${currentTenant.T_Domain}`);
    }

    console.log('--------------------------------------------------------');
    console.log('🏁 FÉDÉRATION INITIALISÉE : 3 TENANTS, 3 ADMINS ISOLÉS.');
    console.log('--------------------------------------------------------');

  } catch (error: any) {
    console.error('❌ RUPTURE DU PROTOCOLE :', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterSystem();