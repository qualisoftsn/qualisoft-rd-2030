/**
 * 🛰️ PROTOCOLE DE SCELLAGE MASTER - QUALISOFT ELITE RD-2026 (elite-sde)
 * VERSION : 8.5.1 (Souveraineté Totale & Conservation des Données)
 * RÔLE : Construction Idempotente de la Fédération Qualisoft (Upsert).
 * FIX : Élimination des deleteMany(). Les données existantes ne sont plus écrasées.
 * CIBLE : PostgreSQL (Qualisoft_DB)
 * RÉVISION : 04 Mars 2026 | 05:55 GMT
 */

import { PrismaClient, Plan, SubscriptionStatus, Role, ProcessFamily } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterSystem(): Promise<void> {
  console.log('--------------------------------------------------------');
  console.log('🌱 INITIALISATION DU KERNEL : MODE UPSERT (CONSERVATION)');
  console.log('--------------------------------------------------------');

  try {
    const SALT = 12;

    // --- REGISTRE DE LA FÉDÉRATION (Les 4 Piliers) ---
    const tenantsData = [
      {
        id: 'MATRIX', // 🚩 ID CRITIQUE pour la Console Master
        name: 'QUALISOFT CORPORATE',
        domain: 'app.qualisoft.sn',
        ceo: 'Abdoulaye Thiongane',
        email: 'ab.thiongane@qualisoft.sn',
        address: '247, Rue du Lac Rose, Dakar, Sénégal',
        phone: '77 441 09 02',
        plan: Plan.GROUPE,
        admin: {
          firstName: 'Abdoulaye',
          lastName: 'THIONGANE',
          email: 'ab.thiongane@qualisoft.sn',
          password: 'mohamed1965ab1711@@@', // Mot de passe Souverain
          role: Role.SUPER_ADMIN
        }
      },
      {
        id: 'TENANT_SDE',
        name: 'SÉNÉGALAISE DES EAUX',
        domain: 'sde.qualisoft.sn',
        ceo: 'Directeur SDE',
        email: 'contact@sde.sn',
        address: 'Hann, Dakar, Sénégal',
        phone: '33 839 37 00',
        plan: Plan.ENTREPRISE,
        admin: {
          firstName: 'Admin',
          lastName: 'SDE',
          email: 'admin.iso@sde.sn',
          password: 'sde@2026',
          role: Role.ADMIN
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
      console.log(`📡 VÉRIFICATION/SCELLAGE DU NŒUD : ${t.domain}...`);

      // 1. Création ou Maintien du Tenant (Upsert : update vide = ne rien écraser)
      const currentTenant = await prisma.tenant.upsert({
        where: { T_Id: t.id },
        update: {}, // Garde les données modifiées par l'utilisateur en production
        create: {
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

      // 2. Création ou Maintien du Site (Siège Social)
      const currentSite = await prisma.site.upsert({
        where: { S_Id: `SITE_${t.id}` },
        update: {},
        create: {
          S_Id: `SITE_${t.id}`,
          S_Name: 'SIÈGE SOCIAL',
          S_Address: t.address,
          S_Country: 'Sénégal',
          tenantId: currentTenant.T_Id,
        },
      });

      // 3. Typologie des Unités Organisationnelles
      const dirType = await prisma.orgUnitType.upsert({
        where: { OUT_Id: `OUT_DIR_${t.id}` },
        update: {},
        create: { OUT_Id: `OUT_DIR_${t.id}`, OUT_Label: 'DIRECTION', tenantId: currentTenant.T_Id }
      });

      await prisma.orgUnitType.upsert({
        where: { OUT_Id: `OUT_DEP_${t.id}` },
        update: {},
        create: { OUT_Id: `OUT_DEP_${t.id}`, OUT_Label: 'DÉPARTEMENT', tenantId: currentTenant.T_Id }
      });

      // 4. Création de l'Unité Racine (DG)
      const rootUnit = await prisma.orgUnit.upsert({
        where: { OU_Id: `OU_DG_${t.id}` },
        update: {},
        create: {
          OU_Id: `OU_DG_${t.id}`,
          OU_Name: 'DIRECTION GÉNÉRALE',
          OU_TypeId: dirType.OUT_Id,
          OU_SiteId: currentSite.S_Id,
          tenantId: currentTenant.T_Id,
        },
      });

      // 5. Architecture des Processus (Cartographie)
      const pilotageType = await prisma.processType.upsert({
        where: { PT_Id: `PT_PIL_${t.id}` },
        update: {},
        create: {
          PT_Id: `PT_PIL_${t.id}`,
          PT_Label: 'PILOTAGE',
          PT_Family: ProcessFamily.PILOTAGE,
          PT_Color: '#3B82F6',
          tenantId: currentTenant.T_Id,
        }
      });

      const supportType = await prisma.processType.upsert({
        where: { PT_Id: `PT_SUP_${t.id}` },
        update: {},
        create: {
          PT_Id: `PT_SUP_${t.id}`,
          PT_Label: 'SUPPORT',
          PT_Family: ProcessFamily.SUPPORT,
          PT_Color: '#64748B',
          tenantId: currentTenant.T_Id,
        }
      });

      // 6. Création ou Maintien de l'Administrateur
      const hashedPassword = await bcrypt.hash(t.admin.password, SALT);
      const adminUser = await prisma.user.upsert({
        where: { U_Id: `USER_ADMIN_${t.id}` },
        update: {}, // IMPORTANT: Ne remet pas le mot de passe par défaut si l'admin l'a changé !
        create: {
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

      // 7. Initialisation des Processus Standards ISO
      const procs = [
        { id: `PR_SMI_${t.id}`, code: 'PR-SMI', libelle: 'Amélioration Continue', typeId: pilotageType.PT_Id },
        { id: `PR_RH_${t.id}`, code: 'PR-RH', libelle: 'Ressources Humaines', typeId: supportType.PT_Id },
      ];

      for (const p of procs) {
        await prisma.processus.upsert({
          where: { PR_Id: p.id },
          update: {},
          create: {
            PR_Id: p.id,
            PR_Code: p.code,
            PR_Libelle: p.libelle,
            PR_TypeId: p.typeId,
            PR_PiloteId: adminUser.U_Id,
            tenantId: currentTenant.T_Id,
          }
        });
      }

      console.log(`✅ NŒUD GARANTI SANS PERTE : ${currentTenant.T_Domain}`);
    }

    console.log('--------------------------------------------------------');
    console.log('🏁 FÉDÉRATION SÉCURISÉE AVEC SUCCÈS.');
    console.log('--------------------------------------------------------');

  } catch (error: any) {
    console.error('❌ RUPTURE DU PROTOCOLE :', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterSystem();