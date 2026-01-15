import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- 🧪 Génération des données de démo Qualisoft ---');

  // 1. Récupération des données de base
  const tenant = await prisma.tenant.findFirst();
  const user = await prisma.user.findFirst({ where: { tenantId: tenant?.T_Id } });
  const site = await prisma.site.findFirst({ where: { tenantId: tenant?.T_Id } });
  const processus = await prisma.processus.findFirst({ where: { tenantId: tenant?.T_Id } });

  if (!tenant || !user || !site || !processus) {
    console.error("❌ Données de base manquantes. Lancez d'abord seed_test.ts");
    return;
  }

  // 2. Création du PAQ (Plan d'Action Qualité)
  const paq = await prisma.pAQ.create({
    data: {
      PAQ_Title: "Plan d'Amélioration Annuel 2025",
      PAQ_Description: "Pilotage de la performance et conformité ISO",
      PAQ_Year: 2025,
      tenantId: tenant.T_Id,
      PAQ_ProcessusId: processus.PR_Id,
      PAQ_QualityManagerId: user.U_Id
    }
  });

  // 3. Création des Actions (On utilise les strings directement pour éviter les erreurs d'import)
  await prisma.action.create({
    data: {
      ACT_Title: "Contrôle réglementaire des équipements",
      ACT_Status: "A_FAIRE", 
      ACT_Priority: "HIGH", 
      ACT_Origin: "AUDIT",
      ACT_Deadline: new Date('2024-12-15'), // Date passée pour tester l'alerte "Retard"
      tenantId: tenant.T_Id,
      ACT_CreatorId: user.U_Id,
      ACT_ResponsableId: user.U_Id,
      ACT_PAQId: paq.PAQ_Id,
    }
  });

  await prisma.action.create({
    data: {
      ACT_Title: "Formation des équipiers de première intervention",
      ACT_Status: "TERMINEE",
      ACT_Priority: "MEDIUM",
      ACT_Origin: "AUTRE",
      ACT_Deadline: new Date('2025-06-01'),
      tenantId: tenant.T_Id,
      ACT_CreatorId: user.U_Id,
      ACT_ResponsableId: user.U_Id,
      ACT_PAQId: paq.PAQ_Id,
    }
  });

  // 4. Création d'un événement SSE (Accident)
  await prisma.sSEEvent.create({
    data: {
      SSE_Type: "ACCIDENT_TRAVAIL",
      SSE_Lieu: "Entrepôt Logistique",
      SSE_Description: "Chute d'un colis sur le pied de l'opérateur.",
      SSE_DateEvent: new Date(),
      SSE_AvecArret: true,
      SSE_NbJoursArret: 5,
      tenantId: tenant.T_Id,
      SSE_SiteId: site.S_Id,
      SSE_ReporterId: user.U_Id,
      SSE_VictimId: user.U_Id
    }
  });

  console.log('--- ✅ Données de démo injectées avec succès ! ---');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed demo :', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });