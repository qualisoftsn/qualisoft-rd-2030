import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('⚖️ Initialisation du Référentiel Légal pour SAGAM ELECTRONICS...');

  // 1. Identification du Contexte
  const tenant = await prisma.tenant.findFirst({ where: { T_Name: "SAGAM ELECTRONICS" } });
  const admin = await prisma.user.findUnique({ where: { U_Email: "pierre.ndiaye@sagam.sn" } });

  if (!tenant || !admin) {
    console.error("❌ Erreur : SAGAM ELECTRONICS ou Pierre Ndiaye introuvables.");
    return;
  }

  // 2. Nettoyage du registre existant (Optionnel, à commenter si tu veux garder tes tests)
  await prisma.senegalLegalRequirement.deleteMany({ where: { tenantId: tenant.T_Id } });

  // 3. Matrice des exigences par Code
  const legalRequirements = [
    // --- CODE DU TRAVAIL ---
    {
      SLR_Category: 'Travail',
      SLR_Title: "DÉCLARATION D'OUVERTURE D'ÉTABLISSEMENT",
      SLR_Description: "Déclaration obligatoire auprès de l'Inspection du Travail et de la Sécurité Sociale lors de toute modification d'activité ou d'effectif.",
      SLR_Reference: "Code du Travail, Art. L.191",
      SLR_Authority: "INSPECTION DU TRAVAIL",
      SLR_Status: "RESPECTEE",
    },
    {
      SLR_Category: 'Travail',
      SLR_Title: "ÉLABORATION DU RÈGLEMENT INTÉRIEUR",
      SLR_Description: "Obligation de définir les règles d'organisation technique du travail, de discipline, d'hygiène et de sécurité.",
      SLR_Reference: "Code du Travail, Art. L.100",
      SLR_Authority: "MINISTÈRE DU TRAVAIL",
      SLR_Status: "A_RESPECTER",
      SLR_Deadline: new Date('2026-06-30'),
    },

    // --- CODE DU COMMERCE (OHADA) ---
    {
      SLR_Category: 'Commerce',
      SLR_Title: "DÉPÔT DES ÉTATS FINANCIERS ANNUELS",
      SLR_Description: "Dépôt obligatoire du bilan, compte de résultat et annexes (SYSCOHADA) au greffe du tribunal de commerce.",
      SLR_Reference: "Acte Uniforme OHADA (Commerce), Art. 440",
      SLR_Authority: "RCCM / TRIBUNAL DE COMMERCE",
      SLR_Status: "EN_COURS",
      SLR_Deadline: new Date('2026-04-30'),
    },

    // --- CODE DE L'ENVIRONNEMENT ---
    {
      SLR_Category: 'Environnement',
      SLR_Title: "GESTION DES DÉCHETS D'ÉQUIPEMENTS ÉLECTRONIQUES (DEEE)",
      SLR_Description: "Obligation de collecte, de stockage et d'élimination des déchets dangereux sans nuire à l'environnement.",
      SLR_Reference: "Code de l'Environnement, Art. L.31 & Loi 2001-01",
      SLR_Authority: "DIRECTION DE L'ENVIRONNEMENT (DECC)",
      SLR_Status: "NON_CONFORME", // Déclenche un écart ISO
      SLR_Comment: "Manque de convention avec un collecteur agréé pour les batteries.",
    },

    // --- CODE CIVIL (OBLIGATIONS) ---
    {
      SLR_Category: 'Santé Sécurité', // Souvent lié au civil pour la responsabilité
      SLR_Title: "ASSURANCE RESPONSABILITÉ CIVILE PROFESSIONNELLE",
      SLR_Description: "Obligation de couverture des dommages causés aux tiers dans le cadre de l'exploitation.",
      SLR_Reference: "Code Civil (COCC Sénégalais), Art. 118",
      SLR_Authority: "DNCF / ASSURANCES",
      SLR_Status: "RESPECTEE",
    },

    // --- FISCALITÉ ---
    {
      SLR_Category: 'Fiscalité',
      SLR_Title: "DÉCLARATION MENSUELLE DE TVA ET VRS",
      SLR_Description: "Paiement et déclaration des taxes via la plateforme E-TAX.",
      SLR_Reference: "Code Général des Impôts, Art. 350",
      SLR_Authority: "DGID",
      SLR_Status: "RESPECTEE",
      SLR_Deadline: new Date('2026-02-15'),
    }
  ];

  // 4. Injection massive
  for (const req of legalRequirements) {
    await prisma.senegalLegalRequirement.create({
      data: {
        ...req,
        tenantId: tenant.T_Id,
        SLR_IsActive: true
      }
    });
  }

  console.log(`✅ Registre Légal SAGAM alimenté (${legalRequirements.length} exigences).`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });