import { Plan, PrismaClient, Role, SubscriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 [SEED]: Nettoyage intégral de la structure Qualisoft...");

  // 1. SUPPRESSION DANS L'ORDRE DES DÉPENDANCES (Du plus spécifique au plus général)
  // On vide d'abord les tables "feuilles" (celles qui n'ont pas d'enfants)
  
  await prisma.indicatorValue.deleteMany({});
  await prisma.indicator.deleteMany({});
  await prisma.finding.deleteMany({});
  await prisma.preuve.deleteMany({});
  await prisma.action.deleteMany({});
  await prisma.nonConformite.deleteMany({});
  await prisma.reclamation.deleteMany({});
  await prisma.risk.deleteMany({}); // 🔥 Supprime les risques avant les processus
  await prisma.documentVersion.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.audit.deleteMany({});
  await prisma.processReview.deleteMany({});
  await prisma.pAQ.deleteMany({});
  await prisma.governanceActivity.deleteMany({});
  await prisma.meetingAttendee.deleteMany({});
  await prisma.meeting.deleteMany({});
  await prisma.causerie.deleteMany({});
  await prisma.sSEEvent.deleteMany({});
  await prisma.sSEStats.deleteMany({});
  await prisma.consumption.deleteMany({});
  await prisma.waste.deleteMany({});
  await prisma.userCompetence.deleteMany({});
  await prisma.competence.deleteMany({});
  await prisma.formation.deleteMany({});
  await prisma.equipment.deleteMany({});
  await prisma.signature.deleteMany({});
  await prisma.securityAuditLog.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.ticket.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.userHabilitation.deleteMany({});
  await prisma.tier.deleteMany({});
  await prisma.processus.deleteMany({}); 
  await prisma.processType.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.orgUnit.deleteMany({});
  await prisma.orgUnitType.deleteMany({});
  await prisma.site.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log("✅ Base de données réinitialisée à 0.");

  const saltRounds = 10;
  const commonPassword = await bcrypt.hash('Password123', saltRounds);

  // 2. RECONSTRUCTION DE L'INSTANCE EXCELLENCE
  const excellenceTenant = await prisma.tenant.create({
    data: {
      T_Id: "ELITE-CORE-001",
      T_Name: "EXCELLENCE INDUSTRIES",
      T_Email: "contact@excellence.sn",
      T_Domain: "excellence.sn",
      T_Plan: Plan.ENTREPRISE,
      T_SubscriptionStatus: SubscriptionStatus.ACTIVE,
    },
  });

  const siteExcellence = await prisma.site.create({
    data: {
      S_Id: "SITE-EXC-001",
      S_Name: "Siège Excellence - Dakar",
      tenantId: excellenceTenant.T_Id,
    },
  });

  await prisma.user.create({
    data: {
      U_Id: "USER-ABD-001",
      U_Email: "ab.thiongane@qualisoft.sn",
      U_PasswordHash: commonPassword,
      U_FirstName: "Abdoulaye",
      U_LastName: "THIONGANE",
      U_Role: Role.ADMIN,
      tenantId: excellenceTenant.T_Id,
      U_SiteId: siteExcellence.S_Id,
    },
  });

  console.log("🟢 [SEED SUCCESS]: Noyau Excellence prêt.");
}

main()
  .catch((e) => {
    console.error("❌ [SEED ERROR]:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });