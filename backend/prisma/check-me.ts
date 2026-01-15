import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({ where: { U_Email: 'ab.thiongane@qualisoft.sn' } });
  console.log(`👤 UTILISATEUR : ${user?.U_Email}`);
  console.log(`🔑 RÔLE ACTUEL : ${user?.U_Role}`);
  
  if (user && user.U_Role !== 'SUPER_ADMIN') {
    await prisma.user.update({
      where: { U_Id: user.U_Id },
      data: { U_Role: 'SUPER_ADMIN' }
    });
    console.log("✅ RÔLE MIS À JOUR EN SUPER_ADMIN !");
  }
}
check();