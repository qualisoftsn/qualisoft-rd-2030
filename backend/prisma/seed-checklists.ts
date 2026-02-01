import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// DONNÉES : Checklist ISO 9001:2015 - Version adaptée au contexte sénégalais
// =============================================================================
const ISO_9001_CHECKLIST = [
  {
    clause: "4.1",
    title: "Compréhension de l'organisation et de son contexte",
    description: "L'organisation a déterminé les enjeux internes et externes pertinents pour son SMQ",
    criteria: "Cartographie des parties intéressées, analyse SWOT, registre des risques",
    isMandatory: true,
    senegalSpecific: false,
    reference: "Décret n° 2014-1198 du 17 novembre 2014 relatif à la normalisation"
  },
  {
    clause: "4.2",
    title: "Compréhension des besoins et attentes des parties intéressées",
    description: "Identification et surveillance des parties intéressées pertinentes",
    criteria: "Registre des parties intéressées avec besoins et attentes documentés",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Code des Obligations Civiles et Commerciales du Sénégal"
  },
  {
    clause: "5.1",
    title: "Leadership et engagement de la direction",
    description: "La direction démontre son leadership et son engagement envers le SMQ",
    criteria: "Politique qualité signée, revues de direction, allocation de ressources",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  },
  {
    clause: "6.1",
    title: "Actions pour traiter les risques et opportunités",
    description: "Détermination des risques et opportunités à traiter",
    criteria: "Matrice des risques, actions planifiées avec responsables et délais",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  },
  {
    clause: "7.1.5",
    title: "Ressources pour le suivi et la mesure",
    description: "Détermination et fourniture des ressources nécessaires",
    criteria: "Étalonnage des équipements de mesure, compétences du personnel",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Arrêté n° 013997 du 28 décembre 2015 relatif à la métrologie"
  },
  {
    clause: "8.2.1",
    title: "Communication avec le client",
    description: "Communication efficace avec les clients sur les produits/services",
    criteria: "Procédure de gestion des réclamations clients, canaux de communication",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Loi n° 2008-11 du 25 janvier 2008 relative à la protection du consommateur"
  },
  {
    clause: "8.4.1",
    title: "Contrôle des processus, produits et services fournis",
    description: "Contrôle des fournisseurs externes et de leurs contributions",
    criteria: "Évaluation des fournisseurs, critères de sélection, surveillance continue",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Code des Marchés Publics du Sénégal"
  },
  {
    clause: "9.1.2",
    title: "Satisfaction du client",
    description: "Surveillance de la perception du client sur la conformité des produits/services",
    criteria: "Enquêtes de satisfaction, analyse des réclamations, indicateurs de performance",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  },
  {
    clause: "10.2",
    title: "Amélioration continue",
    description: "Amélioration continue de la conformité du SMQ",
    criteria: "Actions correctives, revues de direction, indicateurs d'amélioration",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  }
];

// =============================================================================
// DONNÉES : Checklist ISO 14001:2015 - Version adaptée au contexte sénégalais
// =============================================================================
const ISO_14001_CHECKLIST = [
  {
    clause: "4.1",
    title: "Compréhension de l'organisation et de son contexte",
    description: "Détermination des enjeux internes et externes pertinents pour le SME",
    criteria: "Analyse contextuelle, identification des aspects environnementaux significatifs",
    isMandatory: true,
    senegalSpecific: false,
    reference: "Loi n° 2013-10 du 21 juin 2013 relative à la protection de l'environnement"
  },
  {
    clause: "6.1.1",
    title: "Actions générales pour traiter les risques et opportunités",
    description: "Détermination des risques et opportunités liés aux aspects environnementaux",
    criteria: "Matrice des risques environnementaux, plan d'actions",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  },
  {
    clause: "6.1.2",
    title: "Aspects environnementaux",
    description: "Détermination des aspects environnementaux et impacts associés",
    criteria: "Registre des aspects environnementaux, évaluation de la significativité",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Décret n° 2015-1229 du 28 octobre 2015 relatif aux études d'impact environnemental"
  },
  {
    clause: "7.2",
    title: "Compétence",
    description: "Compétences nécessaires pour les personnes travaillant sous le contrôle de l'organisation",
    criteria: "Formation du personnel sur les aspects environnementaux, habilitations",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Arrêté n° 011828 du 15 septembre 2016 relatif à la formation HSE"
  },
  {
    clause: "8.1",
    title: "Planification opérationnelle et contrôle",
    description: "Planification et contrôle des processus pour répondre aux exigences environnementales",
    criteria: "Procédures opérationnelles, gestion des déchets, consommations énergétiques",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Décret n° 2015-1537 du 11 décembre 2015 relatif à la gestion des déchets"
  },
  {
    clause: "9.1.1",
    title: "Suivi, mesure, analyse et évaluation",
    description: "Surveillance des aspects environnementaux significatifs et des objectifs",
    criteria: "Indicateurs de performance environnementale, relevés de consommations",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  },
  {
    clause: "9.1.2",
    title: "Évaluation de la conformité",
    description: "Évaluation périodique de la conformité aux exigences légales",
    criteria: "Registre des exigences légales, vérifications de conformité",
    isMandatory: true,
    senegalSpecific: true,
    reference: "Code de l'Environnement du Sénégal"
  },
  {
    clause: "10.2",
    title: "Amélioration continue",
    description: "Amélioration continue du SME",
    criteria: "Actions correctives environnementales, revues de direction",
    isMandatory: true,
    senegalSpecific: false,
    reference: ""
  }
];

// ==========================================
// FONCTION PRINCIPALE (Logique Corrigée)
// ==========================================

async function main() {
  try {
    console.log('🔄 Démarrage du seed des Checklists...');

    // 1. RECHERCHE DYNAMIQUE DU TENANT
    let targetTenant = await prisma.tenant.findFirst({
      where: { 
        OR: [
          { T_Name: { contains: 'Qualisoft', mode: 'insensitive' } },
          { T_Name: { contains: 'Sagam', mode: 'insensitive' } }
        ]
      }
    });

    // Fallback : Si aucun tenant spécifique trouvé, on prend le premier de la base
    if (!targetTenant) {
      targetTenant = await prisma.tenant.findFirst();
    }

    // Sécurité : Si la base est totalement vide, on crée un tenant
    // CORRECTION : Suppression du champ T_Description qui n'existe pas dans le schéma
    if (!targetTenant) {
      console.log('⚠️ Aucun tenant trouvé. Création du Tenant Master...');
      targetTenant = await prisma.tenant.create({
        data: {
          T_Name: 'Qualisoft Templates',
          T_Email: 'admin@qualisoft-templates.sn',
          T_Domain: 'templates.qualisoft.sn',
          T_IsActive: true
        }
      });
    }

    const tenantId = targetTenant.T_Id;
    console.log(`✅ Tenant cible identifié : ${targetTenant.T_Name} (ID: ${tenantId})`);

    // 2. NETTOYAGE (Idempotence)
    console.log('🧹 Nettoyage des anciennes checklists...');
    await prisma.legalChecklist.deleteMany({
      where: { tenantId: tenantId }
    });
    
    // 3. INSERTION ISO 9001
    console.log(`📝 Création de ${ISO_9001_CHECKLIST.length} points de contrôle ISO 9001...`);
    for (const item of ISO_9001_CHECKLIST) {
      await prisma.legalChecklist.create({
        data: {
          LC_Standard: 'ISO_9001_2015',
          LC_Clause: item.clause,
          LC_Title: item.title,
          LC_Description: item.description,
          LC_Criteria: item.criteria,
          LC_IsMandatory: item.isMandatory,
          LC_SenegalSpecific: item.senegalSpecific,
          LC_Reference: item.reference,
          LC_IsActive: true,
          tenantId: tenantId
        }
      });
    }
    
    // 4. INSERTION ISO 14001
    console.log(`📝 Création de ${ISO_14001_CHECKLIST.length} points de contrôle ISO 14001...`);
    for (const item of ISO_14001_CHECKLIST) {
      await prisma.legalChecklist.create({
        data: {
          LC_Standard: 'ISO_14001_2015',
          LC_Clause: item.clause,
          LC_Title: item.title,
          LC_Description: item.description,
          LC_Criteria: item.criteria,
          LC_IsMandatory: item.isMandatory,
          LC_SenegalSpecific: item.senegalSpecific,
          LC_Reference: item.reference,
          LC_IsActive: true,
          tenantId: tenantId
        }
      });
    }
    
    console.log('✅ SUCCÈS : Toutes les checklists ont été initialisées !');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();