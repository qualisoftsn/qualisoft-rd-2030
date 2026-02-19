/**
 * 🛰️ PROTOCOLE DE SCELLAGE MASTER - QUALISOFT ELITE RD 2030
 * VERSION : 8.0.0 (Correction de la hiérarchie de purge)
 * RÔLE : Nettoyage atomique et reconstruction des 3 Nœuds Piliers.
 * SÉCURITÉ : Hachage Bcrypt Round 12 + Isolation stricte par TenantID.
 */

import { PrismaClient, Plan, SubscriptionStatus, Role, ProcessFamily } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterSystem(): Promise<void> {
  console.log('--------------------------------------------------------');
  console.log('🧹 PURGE DU KERNEL : DÉCONSTRUCTION DES DÉPENDANCES...');
  console.log('--------------------------------------------------------');

  try {
    /**
     * ⚠️ ORDRE DE SUPPRESSION CRITIQUE (Fix P2003)
     * On supprime d'abord les "Enfants" qui pointent vers des "Parents"
     */
    await prisma.processus.deleteMany();        // 1. Dépend de User (Pilote) et ProcessType
    await prisma.user.deleteMany();             // 2. Dépend de OrgUnit, Site et Tenant
    await prisma.orgUnit.deleteMany();          // 3. Dépend de OrgUnitType et Site
    await prisma.processType.deleteMany();      // 4. Dépend de Tenant
    await prisma.orgUnitType.deleteMany();      // 5. Dépend de Tenant
    await prisma.site.deleteMany();             // 6. Dépend de Tenant
    await prisma.tenant.deleteMany();           // 7. Racine finale

    console.log('✨ BASE PURGÉE SANS VIOLATION DE CONTRAINTE.');

    const SALT = 12;

    // --- DONNÉES DE LA FÉDÉRATION (Zéro Élimination) ---
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
          password: 'mohamed1965ab1711@@@', 
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

    for (const t of tenantsData) {
      console.log(`📡 Partenaire validé : ${t.domain}...`);

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

      const currentSite = await prisma.site.create({
        data: {
          S_Id: `SITE_${t.id}`,
          S_Name: 'SIÈGE SOCIAL',
          S_Address: t.address,
          S_Country: 'Sénégal',
          tenantId: currentTenant.T_Id,
        },
      });

      const dirType = await prisma.orgUnitType.create({
        data: { OUT_Id: `OUT_DIR_${t.id}`, OUT_Label: 'DIRECTION', tenantId: currentTenant.T_Id }
      });

      await prisma.orgUnitType.create({
        data: { OUT_Id: `OUT_DEP_${t.id}`, OUT_Label: 'DÉPARTEMENT', tenantId: currentTenant.T_Id }
      });

      const rootUnit = await prisma.orgUnit.create({
        data: {
          OU_Id: `OU_DG_${t.id}`,
          OU_Name: 'DIRECTION GÉNÉRALE',
          OU_TypeId: dirType.OUT_Id,
          OU_SiteId: currentSite.S_Id,
          tenantId: currentTenant.T_Id,
        },
      });

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
    console.log('🏁 FÉDÉRATION INITIALISÉE AVEC SUCCÈS.');
    console.log('--------------------------------------------------------');

  } catch (error: any) {
    console.error('❌ RUPTURE DU PROTOCOLE :', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterSystem();