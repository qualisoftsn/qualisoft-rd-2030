/**
 * 🛰️ PROTOCOLE DE SCELLAGE MASTER - QUALISOFT ELITE RD 2030
 * VERSION : 8.5.0 (Souveraineté Totale & Harmonisation Matrix)
 * RÔLE : Reconstruction atomique des piliers de la Fédération Qualisoft.
 * CIBLE : PostgreSQL (Qualisoft_DB)
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
     * ⚠️ ORDRE DE SUPPRESSION CRITIQUE (Respect des contraintes P2003)
     * On démonte l'architecture de la périphérie vers le centre.
     */
    await prisma.processus.deleteMany();     // Niveau 4
    await prisma.user.deleteMany();          // Niveau 3
    await prisma.orgUnit.deleteMany();       // Niveau 2
    await prisma.processType.deleteMany();   // Niveau 2
    await prisma.orgUnitType.deleteMany();   // Niveau 2
    await prisma.site.deleteMany();          // Niveau 1
    await prisma.tenant.deleteMany();        // Racine (Niveau 0)

    console.log('✨ BASE PURGÉE : PRÊTE POUR RECONSTRUCTION.');

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
      console.log(`📡 SCELLAGE DU NŒUD : ${t.domain}...`);

      // 1. Création du Tenant (Racine)
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

      // 2. Création du Site (Siège Social)
      const currentSite = await prisma.site.create({
        data: {
          S_Id: `SITE_${t.id}`,
          S_Name: 'SIÈGE SOCIAL',
          S_Address: t.address,
          S_Country: 'Sénégal',
          tenantId: currentTenant.T_Id,
        },
      });

      // 3. Typologie des Unités Organisationnelles
      const dirType = await prisma.orgUnitType.create({
        data: { OUT_Id: `OUT_DIR_${t.id}`, OUT_Label: 'DIRECTION', tenantId: currentTenant.T_Id }
      });

      await prisma.orgUnitType.create({
        data: { OUT_Id: `OUT_DEP_${t.id}`, OUT_Label: 'DÉPARTEMENT', tenantId: currentTenant.T_Id }
      });

      // 4. Création de l'Unité Racine (DG)
      const rootUnit = await prisma.orgUnit.create({
        data: {
          OU_Id: `OU_DG_${t.id}`,
          OU_Name: 'DIRECTION GÉNÉRALE',
          OU_TypeId: dirType.OUT_Id,
          OU_SiteId: currentSite.S_Id,
          tenantId: currentTenant.T_Id,
        },
      });

      // 5. Architecture des Processus (Cartographie)
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

      // 6. Création de l'Administrateur Souverain du Nœud
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

      // 7. Initialisation des Processus Standards ISO
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