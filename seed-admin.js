/**
 * CHEMIN ABSOLU : /seed-admin.js
 * PROJET : Qualisoft Elite (Administration)
 * RÔLE : Création du SuperAdmin et du Tenant Racine (Mode Robuste)
 */

const { PrismaClient } = require('@prisma/client');

// 🔐 HASH PRÉ-CALCULÉ pour le mot de passe "password123"
// Cela permet d'exécuter ce script sans avoir besoin d'installer 'bcryptjs' dans le conteneur
const PASSWORD_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4h/X.g/hSi';

// 🛡️ Initialisation forcée avec l'URL de l'environnement
// Contourne les restrictions de Prisma 7 sur le fichier schema.prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const email = 'ab.thiongane@qualisoft.sn';
  const passwordClear = 'password123';

  console.log(`🚀 Démarrage du Seed pour : ${email}`);

  // 1. Création / Mise à jour du Tenant QUALISOFT
  const tenant = await prisma.tenant.upsert({
    where: { T_Domain: 'qualisoft.sn' },
    update: {}, // Ne rien changer si existe
    create: {
      T_Name: 'QUALISOFT HQ',
      T_Domain: 'qualisoft.sn',
      T_Email: 'contact@qualisoft.sn',
      T_Plan: 'GROUPE',
      T_SubscriptionStatus: 'ACTIVE'
    }
  });

  console.log(`🏢 Tenant validé : ${tenant.T_Name} (${tenant.T_Id})`);

  // 2. Création / Mise à jour du SuperAdmin
  const user = await prisma.user.upsert({
    where: { U_Email: email },
    update: {
      U_PasswordHash: PASSWORD_HASH,
      U_Role: 'SUPER_ADMIN',
      tenantId: tenant.T_Id,
      U_IsActive: true
    },
    create: {
      U_Email: email,
      U_FirstName: 'Abdoulaye',
      U_LastName: 'Thiongane',
      U_PasswordHash: PASSWORD_HASH,
      U_Role: 'SUPER_ADMIN',
      tenantId: tenant.T_Id,
      U_IsActive: true
    }
  });

  console.log('✅ SUCCÈS : SuperAdmin opérationnel !');
  console.log('------------------------------------------------');
  console.log(`👉 Login    : ${email}`);
  console.log(`👉 Password : ${passwordClear}`);
  console.log('------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('🚨 ERREUR CRITIQUE :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });