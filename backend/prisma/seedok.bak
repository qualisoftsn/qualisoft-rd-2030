// seed.ts - Données ISO 9001:2015 & ISO 14001 adaptées au contexte sénégalais
// Version FINALE - Sans erreurs TypeScript/Prisma

import { PrismaClient, ProcessFamily, DocCategory, DocStatus, TierType, Role, PartyType, ContextType, ObjectiveStatus, PAQStatus, NCStatus, NCGravity, NCSource, AuditType, AuditStatus, FindingType, ActionStatus, ActionType, ActionOrigin, Priority, SSEType, MeetingStatus, IVStatus, ReviewStatus, RiskStatus, GovernanceType, ActivityStatus, WorkflowStatus, ChangeAction } from '@prisma/client';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Générateur UUID natif (Node.js 15+)
const generateUUID = (): string => crypto.randomUUID();

// Utilitaire de hashage de mot de passe
const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

async function main() {
  console.log('🌱 Démarrage du seed ISO 9001 Sénégal...\n');

  try {
    // ========================
    // 1. CRÉATION DU TENANT QUALISOFT
    // ========================
    const tenant = await prisma.tenant.create({
      data: {
        T_Id: generateUUID(),
        T_Name: 'Qualisoft',
        T_Email: 'ab.thiongane@qualisoft.sn',
        T_Domain: 'qualisoft.sn',
        T_Plan: 'GROUPE',
        T_SubscriptionStatus: 'ACTIVE',
        T_Address: 'Villa 247, Cité Cheikh Hann, Route du Lac Rose, Dakar, Sénégal',
        T_Phone: '+221 77 441 09 02',
        T_CeoName: 'M. Abdoulaye THIONGANE',
        T_ContractDuration: 24,
        T_TacitRenewal: true,
        T_IsActive: true,
      },
    });

    console.log(`✅ Tenant créé: ${tenant.T_Name}`);

    // ========================
    // 2. TYPES D'UNITÉS ORGANISATIONNELLES
    // ========================
    const orgUnitTypes = await prisma.orgUnitType.createMany({
      data: [
        { OUT_Id: generateUUID(), OUT_Label: 'DIRECTION', OUT_Description: 'Instances de gouvernance et décision', tenantId: tenant.T_Id },
        { OUT_Id: generateUUID(), OUT_Label: 'PRODUCTION', OUT_Description: 'Activités de réalisation des produits/services', tenantId: tenant.T_Id },
        { OUT_Id: generateUUID(), OUT_Label: 'QUALITE', OUT_Description: 'Fonction assurance qualité et conformité', tenantId: tenant.T_Id },
        { OUT_Id: generateUUID(), OUT_Label: 'RESSOURCES_HUMAINES', OUT_Description: 'Gestion du personnel et compétences', tenantId: tenant.T_Id },
        { OUT_Id: generateUUID(), OUT_Label: 'LOGISTIQUE', OUT_Description: 'Approvisionnement et gestion des stocks', tenantId: tenant.T_Id },
        { OUT_Id: generateUUID(), OUT_Label: 'COMMERCIAL', OUT_Description: 'Relations clients et développement', tenantId: tenant.T_Id },
        { OUT_Id: generateUUID(), OUT_Label: 'MAINTENANCE', OUT_Description: 'Maintenance des équipements et infrastructures', tenantId: tenant.T_Id },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ ${orgUnitTypes.count} types d'unités créés`);

    // ========================
    // 3. TYPES DE PROCESSUS
    // ========================
    const processTypes = await prisma.processType.createMany({
      data: [
        { 
          PT_Id: generateUUID(), 
          PT_Label: 'PILOTAGE', 
          PT_Description: 'Processus de direction et stratégie', 
          PT_Family: ProcessFamily.PILOTAGE,
          tenantId: tenant.T_Id 
        },
        { 
          PT_Id: generateUUID(), 
          PT_Label: 'RÉALISATION', 
          PT_Description: 'Processus opérationnels de création de valeur', 
          PT_Family: ProcessFamily.OPERATIONNEL,
          tenantId: tenant.T_Id 
        },
        { 
          PT_Id: generateUUID(), 
          PT_Label: 'ÉVALUATION', 
          PT_Description: 'Processus de mesure, analyse et amélioration', 
          PT_Family: ProcessFamily.SUPPORT,
          tenantId: tenant.T_Id 
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ ${processTypes.count} familles de processus créées`);

    // ========================
    // 4. SITES SÉNÉGALAIS
    // ========================
    const sites = await prisma.site.createMany({
      data: [
        { 
          S_Id: generateUUID(), 
          S_Name: 'Dakar - Siège Social (Hann)', 
          S_Address: 'Route de l\'Aéroport, Hann', 
          S_City: 'Dakar', 
          S_Country: 'Sénégal',
          tenantId: tenant.T_Id 
        },
        { 
          S_Id: generateUUID(), 
          S_Name: 'Dakar - Site de Production (Pikine)', 
          S_Address: 'Zone Industrielle de Pikine', 
          S_City: 'Dakar', 
          S_Country: 'Sénégal',
          tenantId: tenant.T_Id 
        },
        { 
          S_Id: generateUUID(), 
          S_Name: 'Thiès - Unité Logistique', 
          S_Address: 'Route Nationale 2, Thiès', 
          S_City: 'Thiès', 
          S_Country: 'Sénégal',
          tenantId: tenant.T_Id 
        },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ ${sites.count} sites sénégalais créés`);

    // ========================
    // 5. RÉCUPÉRATION DES IDs
    // ========================
    const directionType = await prisma.orgUnitType.findFirst({ 
      where: { OUT_Label: 'DIRECTION', tenantId: tenant.T_Id } 
    });
    const qualiteType = await prisma.orgUnitType.findFirst({ 
      where: { OUT_Label: 'QUALITE', tenantId: tenant.T_Id } 
    });
    const productionType = await prisma.orgUnitType.findFirst({ 
      where: { OUT_Label: 'PRODUCTION', tenantId: tenant.T_Id } 
    });
    const commercialType = await prisma.orgUnitType.findFirst({ 
      where: { OUT_Label: 'COMMERCIAL', tenantId: tenant.T_Id } 
    });

    const siegeSite = await prisma.site.findFirst({ 
      where: { S_Name: { contains: 'Siège' }, tenantId: tenant.T_Id } 
    });
    const pikineSite = await prisma.site.findFirst({ 
      where: { S_Name: { contains: 'Pikine' }, tenantId: tenant.T_Id } 
    });

    if (!directionType || !qualiteType || !productionType || !commercialType) {
      throw new Error('Types d\'unités non trouvés');
    }
    if (!siegeSite || !pikineSite) {
      throw new Error('Sites non trouvés');
    }

    // ========================
    // 6. UNITÉS ORGANISATIONNELLES
    // ========================
    const directionId = generateUUID();
    const qualiteId = generateUUID();
    const productionId = generateUUID();
    const commercialId = generateUUID();

    await prisma.orgUnit.createMany({
      data: [
        { 
          OU_Id: directionId,
          OU_Name: 'Direction Générale',
          OU_Code: 'DG',
          OU_TypeId: directionType.OUT_Id,
          OU_SiteId: siegeSite.S_Id,
          tenantId: tenant.T_Id 
        },
        { 
          OU_Id: qualiteId,
          OU_Name: 'Service Qualité & Conformité',
          OU_Code: 'QUAL',
          OU_TypeId: qualiteType.OUT_Id,
          OU_SiteId: siegeSite.S_Id,
          tenantId: tenant.T_Id 
        },
        { 
          OU_Id: productionId,
          OU_Name: 'Atelier de Production',
          OU_Code: 'PROD',
          OU_TypeId: productionType.OUT_Id,
          OU_SiteId: pikineSite.S_Id,
          tenantId: tenant.T_Id 
        },
        { 
          OU_Id: commercialId,
          OU_Name: 'Service Commercial & Clientèle',
          OU_Code: 'COM',
          OU_TypeId: commercialType.OUT_Id,
          OU_SiteId: siegeSite.S_Id,
          tenantId: tenant.T_Id 
        },
      ],
      skipDuplicates: true,
    });

    console.log('✅ Structure organisationnelle créée (4 unités)');

    // ========================
    // 7. UTILISATEUR ADMIN
    // ========================
    const adminPasswordHash = await hashPassword('mohamed1965ab1711@');

    const adminUser = await prisma.user.upsert({
      where: { U_Email: 'ab.thiongane@qualisoft.sn' },
      create: {
        U_Id: generateUUID(),
        U_Email: 'ab.thiongane@qualisoft.sn',
        U_PasswordHash: adminPasswordHash,
        U_FirstName: 'Abdoulaye',
        U_LastName: 'THIONGANE',
        U_Role: 'SUPER_ADMIN',
        U_IsActive: true,
        U_FirstLogin: true,
        tenantId: tenant.T_Id,
        U_SiteId: siegeSite.S_Id,
        U_OrgUnitId: directionId,
      },
      update: {},
    });

    console.log(`✅ Utilisateur admin créé: ${adminUser.U_Email}`);

    // ========================
    // 8. UTILISATEUR SYSTÈME
    // ========================
    const systemPasswordHash = await hashPassword('qs@20252026');

    const systemUser = await prisma.user.upsert({
      where: { U_Email: 'system@qualisoft.sn' },
      create: {
        U_Id: generateUUID(),
        U_Email: 'system@qualisoft.sn',
        U_PasswordHash: systemPasswordHash,
        U_FirstName: 'Système',
        U_LastName: 'Qualisoft',
        U_Role: 'OBSERVATEUR',
        U_IsActive: false,
        U_FirstLogin: false,
        tenantId: tenant.T_Id,
        U_SiteId: siegeSite.S_Id,
        U_OrgUnitId: directionId,
      },
      update: {},
    });

    console.log(`✅ Utilisateur système créé: ${systemUser.U_Email}`);

    // ========================
    // 9. TYPES DE RISQUES
    // ========================
    const riskTypes = await prisma.riskType.createMany({
      data: [
        { RT_Id: generateUUID(), RT_Label: 'QUALITE', RT_Description: 'Risques liés à la qualité des produits/services', tenantId: tenant.T_Id },
        { RT_Id: generateUUID(), RT_Label: 'SECURITE', RT_Description: 'Risques liés à la sécurité des personnes et biens', tenantId: tenant.T_Id },
        { RT_Id: generateUUID(), RT_Label: 'ENVIRONNEMENT', RT_Description: 'Risques liés à l\'impact environnemental', tenantId: tenant.T_Id },
        { RT_Id: generateUUID(), RT_Label: 'REGLEMENTAIRE', RT_Description: 'Risques de non-conformité réglementaire', tenantId: tenant.T_Id },
      ],
      skipDuplicates: true,
    });

    console.log(`✅ ${riskTypes.count} types de risques créés`);

    // ========================
    // 10. PROCESSUS ISO 9001:2015
    // ========================
    const pilotageType = await prisma.processType.findFirst({ 
      where: { PT_Label: 'PILOTAGE', tenantId: tenant.T_Id } 
    });
    const realisationType = await prisma.processType.findFirst({ 
      where: { PT_Label: 'RÉALISATION', tenantId: tenant.T_Id } 
    });
    const evaluationType = await prisma.processType.findFirst({ 
      where: { PT_Label: 'ÉVALUATION', tenantId: tenant.T_Id } 
    });

    if (!pilotageType || !realisationType || !evaluationType) {
      throw new Error('Types de processus non trouvés');
    }

    const processusData = [
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-01',
        PR_Libelle: 'Contexte de l\'Organisation & Leadership',
        PR_Description: 'Analyse des parties intéressées, risques/opportunités, politique qualité',
        PR_TypeId: pilotageType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-02',
        PR_Libelle: 'Ressources & Compétences',
        PR_Description: 'Gestion des ressources humaines, infrastructure, environnement de travail',
        PR_TypeId: pilotageType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-03',
        PR_Libelle: 'Gestion des Relations Clients',
        PR_Description: 'Exigences clients, communication, réclamations (adapté au marché sénégalais)',
        PR_TypeId: realisationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-04',
        PR_Libelle: 'Approvisionnement & Fournisseurs',
        PR_Description: 'Évaluation fournisseurs locaux (ex: SODAGRI, COSUMAR), gestion des achats',
        PR_TypeId: realisationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-05',
        PR_Libelle: 'Production & Prestation de Service',
        PR_Description: 'Réalisation des produits/services, traçabilité, gestion des lots',
        PR_TypeId: realisationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-06',
        PR_Libelle: 'Maintenance des Équipements',
        PR_Description: 'Maintenance préventive adaptée aux coupures électriques fréquentes au Sénégal',
        PR_TypeId: realisationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-07',
        PR_Libelle: 'Surveillance & Mesure',
        PR_Description: 'Indicateurs qualité, satisfaction client, audits internes',
        PR_TypeId: evaluationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-08',
        PR_Libelle: 'Revues de Direction',
        PR_Description: 'Revues périodiques de la direction (adaptées aux réalités PME sénégalaises)',
        PR_TypeId: evaluationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-09',
        PR_Libelle: 'Non-Conformités & Actions Correctives',
        PR_Description: 'Traitement des écarts, analyse des causes racines, actions correctives/préventives',
        PR_TypeId: evaluationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
      {
        PR_Id: generateUUID(),
        PR_Code: 'PR-10',
        PR_Libelle: 'Amélioration Continue',
        PR_Description: 'Démarche Kaizen adaptée au contexte culturel sénégalais (travail collectif)',
        PR_TypeId: evaluationType.PT_Id,
        PR_PiloteId: adminUser.U_Id,
        tenantId: tenant.T_Id,
        PR_Version: 1,
        PR_IsActive: true,
      },
    ];

    for (const proc of processusData) {
      await prisma.processus.upsert({
        where: { PR_Code_tenantId: { PR_Code: proc.PR_Code, tenantId: tenant.T_Id } },
        create: proc,
        update: {},
      });
    }

    console.log('✅ 10 processus ISO 9001:2015 créés');

    // ========================
    // 11. DOCUMENTS OBLIGATOIRES
    // ========================
    const documentsData = [
      { 
        DOC_Id: generateUUID(),
        DOC_Title: 'Manuel Qualité', 
        DOC_Category: DocCategory.MANUEL,
        DOC_Description: 'Document central définissant le système de management qualité selon ISO 9001:2015',
        DOC_Reference: 'MQ-001',
        DOC_Status: DocStatus.APPROUVE,
        DOC_CurrentVersion: 1,
        DOC_IsActive: true,
        DOC_OwnerId: adminUser.U_Id,
        DOC_NextReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        DOC_ReviewFrequencyMonths: 12,
        tenantId: tenant.T_Id,
      },
      { 
        DOC_Id: generateUUID(),
        DOC_Title: 'Procédure Gestion des Documents', 
        DOC_Category: DocCategory.PROCEDURE,
        DOC_Description: 'Contrôle des documents qualité (élaboration, approbation, diffusion)',
        DOC_Reference: 'PR-DOC-001',
        DOC_Status: DocStatus.APPROUVE,
        DOC_CurrentVersion: 1,
        DOC_IsActive: true,
        DOC_OwnerId: adminUser.U_Id,
        DOC_NextReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        DOC_ReviewFrequencyMonths: 12,
        tenantId: tenant.T_Id,
      },
      { 
        DOC_Id: generateUUID(),
        DOC_Title: 'Procédure Gestion des Non-Conformités', 
        DOC_Category: DocCategory.PROCEDURE,
        DOC_Description: 'Traitement des écarts et mise en œuvre d\'actions correctives',
        DOC_Reference: 'PR-NC-001',
        DOC_Status: DocStatus.APPROUVE,
        DOC_CurrentVersion: 1,
        DOC_IsActive: true,
        DOC_OwnerId: adminUser.U_Id,
        DOC_NextReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        DOC_ReviewFrequencyMonths: 12,
        tenantId: tenant.T_Id,
      },
      { 
        DOC_Id: generateUUID(),
        DOC_Title: 'Procédure Audits Internes', 
        DOC_Category: DocCategory.PROCEDURE,
        DOC_Description: 'Planification et réalisation des audits internes du SMQ',
        DOC_Reference: 'PR-AUD-001',
        DOC_Status: DocStatus.APPROUVE,
        DOC_CurrentVersion: 1,
        DOC_IsActive: true,
        DOC_OwnerId: adminUser.U_Id,
        DOC_NextReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        DOC_ReviewFrequencyMonths: 12,
        tenantId: tenant.T_Id,
      },
      { 
        DOC_Id: generateUUID(),
        DOC_Title: 'Politique Qualité', 
        DOC_Category: DocCategory.ENREGISTREMENT,
        DOC_Description: 'Engagement de la direction en matière de qualité (signé par le DG)',
        DOC_Reference: 'POL-Q-001',
        DOC_Status: DocStatus.APPROUVE,
        DOC_CurrentVersion: 1,
        DOC_IsActive: true,
        DOC_OwnerId: adminUser.U_Id,
        DOC_NextReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        DOC_ReviewFrequencyMonths: 12,
        tenantId: tenant.T_Id,
      },
      { 
        DOC_Id: generateUUID(),
        DOC_Title: 'Guide Bonnes Pratiques Hygiène (Contexte Sénégal)', 
        DOC_Category: DocCategory.CONSIGNE,
        DOC_Description: 'Consignes adaptées aux réalités sanitaires locales (eau, électricité)',
        DOC_Reference: 'CON-HYG-001',
        DOC_Status: DocStatus.APPROUVE,
        DOC_CurrentVersion: 1,
        DOC_IsActive: true,
        DOC_OwnerId: adminUser.U_Id,
        DOC_NextReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        DOC_ReviewFrequencyMonths: 12,
        tenantId: tenant.T_Id,
      },
    ];

    for (const doc of documentsData) {
      await prisma.document.upsert({
        where: { DOC_Reference: doc.DOC_Reference! },
        create: doc,
        update: {},
      });
    }

    console.log(`✅ ${documentsData.length} documents qualité créés`);

    // ========================
    // 12. TIERS SÉNÉGALAIS
    // ========================
    const tiersData = [
      { 
        TR_Id: generateUUID(),
        TR_Name: 'SONATEL', 
        TR_Type: TierType.CLIENT,
        TR_Email: 'qualite@sonatel.sn',
        TR_Phone: '+221 33 849 49 49',
        tenantId: tenant.T_Id,
        TR_IsActive: true,
      },
      { 
        TR_Id: generateUUID(),
        TR_Name: 'SENELEC', 
        TR_Type: TierType.CLIENT,
        TR_Email: 'approvisionnement@senlec.sn',
        TR_Phone: '+221 33 847 90 90',
        tenantId: tenant.T_Id,
        TR_IsActive: true,
      },
      { 
        TR_Id: generateUUID(),
        TR_Name: 'SODAGRI (Distribution)', 
        TR_Type: TierType.FOURNISSEUR,
        TR_Email: 'contact@sodagri.sn',
        TR_Phone: '+221 33 869 10 00',
        tenantId: tenant.T_Id,
        TR_IsActive: true,
      },
      { 
        TR_Id: generateUUID(),
        TR_Name: 'COSUMAR', 
        TR_Type: TierType.FOURNISSEUR,
        TR_Email: 'achats@cosumar.sn',
        TR_Phone: '+221 33 839 96 96',
        tenantId: tenant.T_Id,
        TR_IsActive: true,
      },
      { 
        TR_Id: generateUUID(),
        TR_Name: 'ANSD (Agence Nationale de la Statistique)', 
        TR_Type: TierType.ETAT,
        TR_Email: 'contact@ansd.sn',
        TR_Phone: '+221 33 839 01 66',
        tenantId: tenant.T_Id,
        TR_IsActive: true,
      },
    ];

    for (const tier of tiersData) {
      await prisma.tier.create({
        data: tier,
      });
    }

    console.log(`✅ ${tiersData.length} tiers sénégalais créés`);

    // ========================
    // 13. INDICATEURS DE PERFORMANCE
    // ========================
    const processusProd = await prisma.processus.findFirst({
      where: { PR_Code: 'PR-05', tenantId: tenant.T_Id }
    });

    if (!processusProd) {
      throw new Error('Processus de production non trouvé');
    }

    const indicatorsData = [
      {
        IND_Id: generateUUID(),
        IND_Code: 'KPI-01',
        IND_Libelle: 'Taux de Non-Conformité Produits',
        IND_Unite: '%',
        IND_Cible: 2.5,
        IND_Frequence: 'MENSUEL',
        IND_ProcessusId: processusProd.PR_Id,
        tenantId: tenant.T_Id,
        IND_IsActive: true,
      },
      {
        IND_Id: generateUUID(),
        IND_Code: 'KPI-02',
        IND_Libelle: 'Délai Moyen Traitement Réclamations',
        IND_Unite: 'jours',
        IND_Cible: 5,
        IND_Frequence: 'MENSUEL',
        IND_ProcessusId: processusProd.PR_Id,
        tenantId: tenant.T_Id,
        IND_IsActive: true,
      },
      {
        IND_Id: generateUUID(),
        IND_Code: 'KPI-03',
        IND_Libelle: 'Satisfaction Client (NPS)',
        IND_Unite: 'points',
        IND_Cible: 75,
        IND_Frequence: 'TRIMESTRIEL',
        IND_ProcessusId: processusProd.PR_Id,
        tenantId: tenant.T_Id,
        IND_IsActive: true,
      },
      {
        IND_Id: generateUUID(),
        IND_Code: 'KPI-04',
        IND_Libelle: 'Taux de Réussite Audits Internes',
        IND_Unite: '%',
        IND_Cible: 90,
        IND_Frequence: 'SEMESTRIEL',
        IND_ProcessusId: processusProd.PR_Id,
        tenantId: tenant.T_Id,
        IND_IsActive: true,
      },
    ];

    for (const ind of indicatorsData) {
      await prisma.indicator.upsert({
        where: { IND_Code_tenantId: { IND_Code: ind.IND_Code, tenantId: tenant.T_Id } },
        create: ind,
        update: {},
      });
    }

    console.log(`✅ ${indicatorsData.length} indicateurs qualité créés`);

    // ========================
    // 14. COMPÉTENCES QUALITÉ
    // ========================
    const competencesData = [
      { 
        CP_Id: generateUUID(),
        CP_Name: 'Auditeur Interne ISO 9001', 
        CP_NiveauRequis: 3,
        tenantId: tenant.T_Id,
        CP_IsActive: true,
      },
      { 
        CP_Id: generateUUID(),
        CP_Name: 'Pilote de Processus', 
        CP_NiveauRequis: 4,
        tenantId: tenant.T_Id,
        CP_IsActive: true,
      },
      { 
        CP_Id: generateUUID(),
        CP_Name: 'Gestion des Risques', 
        CP_NiveauRequis: 3,
        tenantId: tenant.T_Id,
        CP_IsActive: true,
      },
      { 
        CP_Id: generateUUID(),
        CP_Name: 'Analyse des Causes Racines (5P/8D)', 
        CP_NiveauRequis: 3,
        tenantId: tenant.T_Id,
        CP_IsActive: true,
      },
      { 
        CP_Id: generateUUID(),
        CP_Name: 'Maîtrise Statistique des Procédés', 
        CP_NiveauRequis: 2,
        tenantId: tenant.T_Id,
        CP_IsActive: true,
      },
      { 
        CP_Id: generateUUID(),
        CP_Name: 'Communication Inter-culturelle (Contexte Sénégal)', 
        CP_NiveauRequis: 4,
        tenantId: tenant.T_Id,
        CP_IsActive: true,
      },
    ];

    for (const comp of competencesData) {
      await prisma.competence.create({
        data: comp,
      });
    }

    console.log(`✅ ${competencesData.length} compétences qualité définies`);

    // ========================
    // 15. CONTEXTE ORGANISATIONNEL ISO 9001 §4
    // ========================
    const orgContextsData = [
      {
        OC_Id: generateUUID(),
        OC_Type: ContextType.ENJEU_INTERNE,
        OC_Title: 'Enjeux Internes - Structure et Culture',
        OC_Description: 'Analyse des forces et faiblesses internes de l\'organisation',
        OC_Impact: 'Impact sur la stratégie qualité et la performance',
        OC_ActionsPlanif: 'Renforcement des compétences, modernisation des équipements',
        OC_ReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        OC_IsActive: true,
        tenantId: tenant.T_Id,
      },
      {
        OC_Id: generateUUID(),
        OC_Type: ContextType.ENJEU_EXTERNE,
        OC_Title: 'Enjeux Externes - Marché Sénégalais',
        OC_Description: 'Analyse du marché, concurrence, exigences réglementaires locales',
        OC_Impact: 'Nécessité d\'adaptation aux normes sénégalaises et ouest-africaines',
        OC_ActionsPlanif: 'Veille réglementaire, benchmark concurrentiel',
        OC_ReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        OC_IsActive: true,
        tenantId: tenant.T_Id,
      },
      {
        OC_Id: generateUUID(),
        OC_Type: ContextType.PARTIE_INTERESSEE,
        OC_Title: 'Parties Intéressées Clés',
        OC_Description: 'Identification et analyse des parties prenantes (clients, fournisseurs, autorités)',
        OC_Impact: 'Gestion des attentes et exigences des parties prenantes',
        OC_ActionsPlanif: 'Cartographie des parties prenantes, plan de communication',
        OC_ReviewDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        OC_IsActive: true,
        tenantId: tenant.T_Id,
      },
    ];

    for (const ctx of orgContextsData) {
      await prisma.organizationContext.create({
        data: ctx,
      });
    }

    console.log(`✅ ${orgContextsData.length} contextes organisationnels créés`);

    // ========================
    // 16. PARTIES INTÉRESSÉES
    // ========================
    const interestedPartiesData = [
      {
        IP_Id: generateUUID(),
        IP_Name: 'Clients Finaux',
        IP_Type: PartyType.CLIENT,
        IP_Needs: 'Produits/services de qualité, délais respectés, prix compétitifs',
        IP_Expectations: 'Fiabilité, transparence, réactivité',
        IP_Requirements: 'Conformité aux spécifications, traçabilité',
        IP_IsActive: true,
        tenantId: tenant.T_Id,
      },
      {
        IP_Id: generateUUID(),
        IP_Name: 'Autorités Sénégalaises',
        IP_Type: PartyType.AUTORITE,
        IP_Needs: 'Respect des réglementations locales, normes qualité',
        IP_Expectations: 'Conformité légale, reporting régulier',
        IP_Requirements: 'Certifications obligatoires, déclarations fiscales',
        IP_IsActive: true,
        tenantId: tenant.T_Id,
      },
      {
        IP_Id: generateUUID(),
        IP_Name: 'Employés',
        IP_Type: PartyType.EMPLOYE,
        IP_Needs: 'Conditions de travail sécurisées, formation, évolution',
        IP_Expectations: 'Reconnaissance, équité, dialogue social',
        IP_Requirements: 'Respect du code du travail sénégalais',
        IP_IsActive: true,
        tenantId: tenant.T_Id,
      },
    ];

    for (const party of interestedPartiesData) {
      await prisma.interestedParty.create({
        data: party,
      });
    }

    console.log(`✅ ${interestedPartiesData.length} parties intéressées créées`);

    // ========================
    // RÉCAPITULATIF FINAL
    // ========================
    console.log('\n✨ Seed terminé avec succès !');
    console.log('📊 Statistiques du tenant de démo:');
    console.log(`   • ${orgUnitTypes.count} types d'unités`);
    console.log(`   • 4 unités organisationnelles`);
    console.log(`   • 3 sites sénégalais`);
    console.log(`   • 10 processus ISO 9001:2015`);
    console.log(`   • 6 documents obligatoires`);
    console.log(`   • 4 indicateurs qualité`);
    console.log(`   • 5 tiers locaux`);
    console.log(`   • 6 compétences qualité`);
    console.log(`   • 3 types de risques`);
    console.log(`   • 3 contextes organisationnels`);
    console.log(`   • 3 parties intéressées`);
    console.log(`   • 2 utilisateurs (admin + système)`);
    console.log('\n🔑 Identifiants admin:');
    console.log(`   Email: ab.thiongane@qualisoft.sn`);
    console.log(`   Mot de passe: mohamed1965ab1711@`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur fatale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });