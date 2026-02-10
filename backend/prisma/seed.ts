/**
 * CHEMIN ABSOLU : /prisma/seed.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Déploiement du Noyau Souverain (Master Seed)
 * SÉCURITÉ : Injection du SUPER_ADMIN et du Site Maître
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedMasterAdmin(): Promise<void> {
  console.log('--------------------------------------------------------');
  console.log('🛡️  SYNCHRONISATION DU NOYAU MASTER QUALISOFT ELITE...');
  console.log('--------------------------------------------------------');

  // 1. CONFIGURATION RÉGALIENNE
  const masterEmail = 'ab.thiongane@qualisoft.sn';
  const masterDomain = 'qualisoft.sn';
  // Mot de passe scellé par le CTO
  const hashedPassword = await bcrypt.hash('mohamed1965ab1711@@@', 12);

  try {
    // 2. GARANTIE DU TENANT MASTER (QUALISOFT CORPORATE)
    const qualisoftTenant = await prisma.tenant.upsert({
      where: { T_Domain: masterDomain },
      update: {
        T_Name: 'QUALISOFT CORPORATE',
        T_Email: 'contact@qualisoft.sn',
        T_Plan: 'GROUPE',
        T_SubscriptionStatus: 'ACTIVE',
        T_IsActive: true,
        T_ContractDuration: 99,
      },
      create: {
        T_Name: 'QUALISOFT CORPORATE',
        T_Email: 'contact@qualisoft.sn',
        T_Domain: masterDomain,
        T_Plan: 'GROUPE',
        T_SubscriptionStatus: 'ACTIVE',
        T_IsActive: true,
        T_ContractDuration: 99,
        T_TacitRenewal: true,
      },
    });

    // 3. GARANTIE DU SITE MAÎTRE (INDISPENSABLE POUR U_SiteId)
    // On crée un site par défaut pour le siège social de Qualisoft
    const masterSite = await prisma.site.upsert({
      where: { 
        // Hypothèse : S_Name ou une combinaison unique selon ton schéma Prisma
        // Ici, on utilise une recherche par nom liée au tenant
        S_Id: 'MASTER_SITE_QS' // Utilisation d'un ID fixe si ton schéma le permet, sinon filtrage
      },
      update: {
        S_Name: 'SIÈGE QUALISOFT CORPORATE',
        S_IsActive: true,
      },
      create: {
        S_Id: 'MASTER_SITE_QS',
        S_Name: 'SIÈGE QUALISOFT CORPORATE',
        tenantId: qualisoftTenant.T_Id,
        S_IsActive: true,
      },
    });

    // 4. GARANTIE DE L'ADMINISTRATEUR UNIVERSEL (CTO)
    const masterAdmin = await prisma.user.upsert({
      where: { U_Email: masterEmail },
      update: {
        U_FirstName: 'Abdoulaye',
        U_LastName: 'THIONGANE',
        U_PasswordHash: hashedPassword,
        U_Role: 'SUPER_ADMIN',
        U_IsActive: true,
        tenantId: qualisoftTenant.T_Id,
        U_SiteId: masterSite.S_Id, // Liaison au site maître
      },
      create: {
        U_FirstName: 'Abdoulaye',
        U_LastName: 'THIONGANE',
        U_Email: masterEmail,
        U_PasswordHash: hashedPassword,
        U_Role: 'SUPER_ADMIN',
        U_IsActive: true,
        tenantId: qualisoftTenant.T_Id,
        U_SiteId: masterSite.S_Id,
      },
    });

    console.log(`✅ NOYAU SCELLÉ : ${masterAdmin.U_FirstName} ${masterAdmin.U_LastName}`);
    console.log(`📡 TENANT ID   : ${qualisoftTenant.T_Id}`);
    console.log(`📍 SITE ID     : ${masterSite.S_Id}`);
    console.log(`📧 MASTER EMAIL : ${masterAdmin.U_Email}`);
    console.log('--------------------------------------------------------');

  } catch (exception: unknown) {
    const message = exception instanceof Error ? exception.message : 'Inconnue';
    console.error('❌ ERREUR CRITIQUE DE SEEDING :', message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedMasterAdmin();