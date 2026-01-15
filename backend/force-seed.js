const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:password123@127.0.0.1:5433/qualisoft_db?schema=public"
    }
  }
});

async function run() {
  console.log("🚀 Tentative d'injection forcée...");
  try {
    const tenant = await prisma.tenant.create({
      data: { name: "QUALISOFT SARL" }
    });
    console.log("✅ RÉUSSITE ! Données insérées :", tenant.name);
  } catch (e) {
    console.error("❌ ÉCHEC :", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();