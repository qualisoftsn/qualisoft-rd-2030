import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Connexion au Noyau SAGAM ELECTRONICS...');

  // 1. Récupération du Tenant existant
  const tenant = await prisma.tenant.findFirst({
    where: { T_Name: "SAGAM ELECTRONICS" }
  });

  if (!tenant) {
    console.error("❌ Erreur : Tenant 'SAGAM ELECTRONICS' introuvable. Vérifiez le nom en base.");
    return;
  }

  // 2. Récupération de l'administrateur Pierre Ndiaye
  const admin = await prisma.user.findUnique({
    where: { U_Email: "pierre.ndiaye@sagam.sn" }
  });

  if (!admin) {
    console.error("❌ Erreur : Utilisateur 'pierre.ndiaye@sagam.sn' introuvable.");
    return;
  }

  console.log(`📡 Ciblage : ${tenant.T_Name} | Pilote : ${admin.U_FirstName} ${admin.U_LastName}`);

  // 3. Nettoyage des anciennes formations pour ce tenant (Traçabilité)
  await prisma.formation.deleteMany({
    where: { tenantId: tenant.T_Id }
  });

  // 4. Scénarios de formation 2026
  const trainingData = [
    {
      FOR_Title: "SÉCURITÉ DES SYSTÈMES ÉLECTRONIQUES - AVANCÉ",
      FOR_Date: new Date('2026-02-15'),
      FOR_Status: "TERMINE",
      FOR_Expiry: new Date('2028-02-15'),
      FOR_Provider: "INTERNE SAGAM",
    },
    {
      FOR_Title: "AUDITEUR INTERNE ISO 9001:2015",
      FOR_Date: new Date('2026-05-20'),
      FOR_Status: "PLANIFIE",
      FOR_Provider: "BUREAU VERITAS",
    },
    {
      FOR_Title: "HABILITATION ÉLECTRIQUE B2V - RECYCLAGE",
      FOR_Date: new Date('2024-01-10'),
      FOR_Expiry: new Date('2026-01-10'), // 🔴 EXPIREE (Alerte rouge au tableau de bord)
      FOR_Status: "TERMINE",
      FOR_Provider: "APAVE SÉNÉGAL",
    }
  ];

  for (const f of trainingData) {
    await prisma.formation.create({
      data: {
        ...f,
        tenantId: tenant.T_Id,
        FOR_UserId: admin.U_Id,
        FOR_IsActive: true
      }
    });
  }

  console.log('✅ Plan de formation SAGAM ELECTRONICS mis à jour.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });