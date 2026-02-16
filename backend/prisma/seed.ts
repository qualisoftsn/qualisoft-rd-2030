/**
 * 🛰️ PROTOCOLE DE SCELLAGE MASTER - QUALISOFT ELITE RD 2030
 * RÔLE : Initialisation du Noyau conformément au Schéma Prisma V2
 * NOMENCLATURE : T_ (Tenant), U_ (User), S_ (Site), OUT_ (OrgUnitType), OU_ (OrgUnit)
 */

import { PrismaClient, Plan, SubscriptionStatus, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterSystem(): Promise<void> {
  console.log('--------------------------------------------------------');
  console.log('🛡️  DÉPLOIEMENT DU NOYAU MASTER QUALISOFT ELITE...');
  console.log('--------------------------------------------------------');

  // 1. CONFIGURATION RÉGALIENNE
  const masterEmail = 'ab.thiongane@qualisoft.sn';
  const masterDomain = 'qualisoft.sn';
  const masterPassword = 'mohamed1965ab1711@@@'; 
  const hashedPassword = await bcrypt.hash(masterPassword, 12);

  try {
    // 2. GARANTIE DU TENANT MASTER (QUALISOFT CORPORATE)
    const qualisoftTenant = await prisma.tenant.upsert({
      where: { T_Domain: masterDomain },
      update: {
        T_Name: 'QUALISOFT CORPORATE',
        T_Email: 'contact@qualisoft.sn',
        T_Plan: Plan.GROUPE,
        T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
        T_IsActive: true,
      },
      create: {
        T_Name: 'QUALISOFT CORPORATE',
        T_Email: 'contact@qualisoft.sn',
        T_Domain: masterDomain,
        T_Plan: Plan.GROUPE,
        T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
        T_IsActive: true,
        T_ContractDuration: 99,
        T_TacitRenewal: true,
      },
    });

    // 3. GARANTIE DU SITE MAÎTRE (ANCRAGE)
    const masterSite = await prisma.site.upsert({
      where: { S_Id: 'MASTER_SITE_QS' },
      update: {
        S_Name: 'SIÈGE QUALISOFT CORPORATE',
        S_IsActive: true,
      },
      create: {
        S_Id: 'MASTER_SITE_QS',
        S_Name: 'SIÈGE QUALISOFT CORPORATE',
        S_Address: 'Dakar, Sénégal',
        S_Country: 'Sénégal',
        S_IsActive: true,
        tenantId: qualisoftTenant.T_Id,
      },
    });

    // 4. INJECTION DES TYPES D'UNITÉS (ORG UNIT TYPES)
    const typesToCreate = [
      { id: 'OUT_MASTER_DIR', label: 'DIRECTION' },
      { id: 'OUT_MASTER_DEP', label: 'DÉPARTEMENT' },
      { id: 'OUT_MASTER_SRV', label: 'SERVICE' },
    ];

    for (const item of typesToCreate) {
      await prisma.orgUnitType.upsert({
        where: { OUT_Id: item.id },
        update: { OUT_Label: item.label },
        create: {
          OUT_Id: item.id,
          OUT_Label: item.label,
          OUT_IsActive: true,
          tenantId: qualisoftTenant.T_Id,
        },
      });
    }

    // 5. CRÉATION DE LA CELLULE MÈRE (ORGANIC UNIT)
    const masterDG = await prisma.orgUnit.upsert({
      where: { OU_Id: 'OU_MASTER_DG' },
      update: { OU_Name: 'DIRECTION GÉNÉRALE' },
      create: {
        OU_Id: 'OU_MASTER_DG',
        OU_Name: 'DIRECTION GÉNÉRALE',
        OU_IsActive: true,
        OU_TypeId: 'OUT_MASTER_DIR', // Liaison au type DIRECTION créé ci-dessus
        OU_SiteId: masterSite.S_Id,   // Liaison au Site Maître
        tenantId: qualisoftTenant.T_Id,
      },
    });

    // 6. GARANTIE DE L'ADMINISTRATEUR UNIVERSEL (CTO)
    const masterAdmin = await prisma.user.upsert({
      where: { U_Email: masterEmail },
      update: {
        U_FirstName: 'Abdoulaye',
        U_LastName: 'THIONGANE',
        U_PasswordHash: hashedPassword,
        U_Role: Role.SUPER_ADMIN,
        U_IsActive: true,
        tenantId: qualisoftTenant.T_Id,
        U_SiteId: masterSite.S_Id,
        U_OrgUnitId: masterDG.OU_Id, // Liaison à la Direction Générale
      },
      create: {
        U_FirstName: 'Abdoulaye',
        U_LastName: 'THIONGANE',
        U_Email: masterEmail,
        U_PasswordHash: hashedPassword,
        U_Role: Role.SUPER_ADMIN,
        U_IsActive: true,
        U_FirstLogin: false,
        tenantId: qualisoftTenant.T_Id,
        U_SiteId: masterSite.S_Id,
        U_OrgUnitId: masterDG.OU_Id,
      },
    });

    console.log(`✅ NOYAU SCELLÉ : ${masterAdmin.U_FirstName} ${masterAdmin.U_LastName}`);
    console.log(`📡 TENANT ID   : ${qualisoftTenant.T_Id}`);
    console.log(`📍 SITE ID     : ${masterSite.S_Id}`);
    console.log(`🏢 UNITÉ ORG.  : ${masterDG.OU_Name}`);
    console.log(`📧 MASTER EMAIL : ${masterAdmin.U_Email}`);
    console.log('--------------------------------------------------------');

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Inconnue';
    console.error('❌ ERREUR CRITIQUE DE SEEDING :', msg);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterSystem();