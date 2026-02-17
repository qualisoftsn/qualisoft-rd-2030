/**
 * 🛰️ PROTOCOLE DE SCELLAGE MASTER - QUALISOFT ELITE RD 2030
 * VERSION : 6.0.0 (Strict Schema Compliance)
 * RÔLE : Initialisation du Noyau Master et des 3 Tenants Piliers.
 * SÉCURITÉ : Hachage Bcrypt Round 12 pour les accès éternels.
 */

import { PrismaClient, Plan, SubscriptionStatus, Role, ProcessFamily } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterSystem(): Promise<void> {
  console.log('--------------------------------------------------------');
  console.log('🛡️  DÉPLOIEMENT DU NOYAU MASTER QUALISOFT ELITE...');
  console.log('--------------------------------------------------------');

  const SALT = 12;

  // --- DONNÉES DES 3 PILIERS DE LA FÉDÉRATION ---
  const tenantsData = [
    {
      id: 'TENANT_QS_CORP',
      name: 'QUALISOFT CORPORATE',
      domain: 'qs.qualisoft.sn',
      ceo: 'Abdoulaye Thiongane',
      email: 'qualisoft@qualisoft.sn',
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
      email: 'info@pad.sn',
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
      email: 'sagam@sagam.sn',
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
      console.log(`🚀 INITIALISATION : ${t.name}`);

      // 1. TENANT (Conforme T_)
      const tenant = await prisma.tenant.upsert({
        where: { T_Domain: t.domain },
        update: { T_SubscriptionStatus: SubscriptionStatus.ACTIVE },
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

      // 2. SITE (Conforme S_)
      const site = await prisma.site.upsert({
        where: { S_Id: `SITE_HQ_${t.id}` },
        update: { S_Name: 'SIÈGE SOCIAL' },
        create: {
          S_Id: `SITE_HQ_${t.id}`,
          S_Name: 'SIÈGE SOCIAL',
          S_Address: t.address,
          S_Country: 'Sénégal',
          tenantId: tenant.T_Id,
        },
      });

      // 3. TYPES D'UNITÉS (Conforme OUT_)
      const out_dir = await prisma.orgUnitType.upsert({
        where: { OUT_Label_tenantId: { OUT_Label: 'DIRECTION', tenantId: tenant.T_Id } },
        update: {},
        create: { OUT_Label: 'DIRECTION', tenantId: tenant.T_Id }
      });

      // 4. UNITÉ ORGANIQUE (Conforme OU_)
      const rootUnit = await prisma.orgUnit.upsert({
        where: { OU_Id: `OU_DG_${t.id}` },
        update: { OU_Name: 'DIRECTION GÉNÉRALE' },
        create: {
          OU_Id: `OU_DG_${t.id}`,
          OU_Name: 'DIRECTION GÉNÉRALE',
          OU_TypeId: out_dir.OUT_Id,
          OU_SiteId: site.S_Id,
          tenantId: tenant.T_Id,
        },
      });

      // 5. 🛡️ UTILISATEUR ADMIN (Hachage Bcrypt Round 12)
      const hashedPassword = await bcrypt.hash(t.admin.password, SALT);
      const adminUser = await prisma.user.upsert({
        where: { U_Email: t.admin.email },
        update: { U_PasswordHash: hashedPassword },
        create: {
          U_FirstName: t.admin.firstName,
          U_LastName: t.admin.lastName.toUpperCase(),
          U_Email: t.admin.email,
          U_PasswordHash: hashedPassword,
          U_Role: t.admin.role,
          U_IsActive: true,
          U_FirstLogin: false,
          tenantId: tenant.T_Id,
          U_SiteId: site.S_Id,
          U_OrgUnitId: rootUnit.OU_Id,
        },
      });

      // 6. TYPES DE PROCESSUS (Conforme PT_ - SANS PT_Code)
      const pilotageType = await prisma.processType.upsert({
        where: { PT_Label_tenantId: { PT_Label: 'PILOTAGE', tenantId: tenant.T_Id } },
        update: {},
        create: {
          PT_Label: 'PILOTAGE',
          PT_Family: ProcessFamily.PILOTAGE,
          PT_Color: '#3B82F6',
          tenantId: tenant.T_Id,
        }
      });

      const supportType = await prisma.processType.upsert({
        where: { PT_Label_tenantId: { PT_Label: 'SUPPORT', tenantId: tenant.T_Id } },
        update: {},
        create: {
          PT_Label: 'SUPPORT',
          PT_Family: ProcessFamily.SUPPORT,
          PT_Color: '#64748B',
          tenantId: tenant.T_Id,
        }
      });

      // 7. PROCESSUS STANDARDS (Conforme PR_)
      const standardProcs = [
        { code: 'PR-SMI', libelle: 'Amélioration Continue', typeId: pilotageType.PT_Id },
        { code: 'PR-RH', libelle: 'Ressources Humaines', typeId: supportType.PT_Id },
      ];

      for (const p of standardProcs) {
        await prisma.processus.upsert({
          where: { PR_Code_tenantId: { PR_Code: p.code, tenantId: tenant.T_Id } },
          update: { PR_Libelle: p.libelle },
          create: {
            PR_Code: p.code,
            PR_Libelle: p.libelle,
            PR_TypeId: p.typeId,
            PR_PiloteId: adminUser.U_Id, // L'admin devient le pilote par défaut
            tenantId: tenant.T_Id,
          }
        });
      }

      console.log(`✅ NŒUD SCELLÉ : ${tenant.T_Domain}`);
    }

    console.log('--------------------------------------------------------');
    console.log('🏁 NOYAU ELITE INITIALISÉ ET SÉCURISÉ.');
    console.log('--------------------------------------------------------');

  } catch (error: any) {
    console.error('❌ ERREUR CRITIQUE DE SCELLAGE :', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterSystem();