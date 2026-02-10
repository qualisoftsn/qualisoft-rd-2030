/**
 * CHEMIN ABSOLU : /backend/test/provisioning.spec.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Test d'Intégration du Provisioning (Transaction Atomique)
 * SÉCURITÉ : Validation du préfixe global et du token Master
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('🏛️  MATRIX : PROVISIONING SYSTEM', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let masterToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 🛡️ ALIGNEMENT AVEC LE SERVEUR RÉEL (Résout le 404)
    app.setGlobalPrefix('api'); 
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // 🛡️ GÉNÉRATION DU JETON SOUVERAIN
    masterToken = jwtService.sign({
      sub: 'MASTER_ID',                     // Souvent mappé sur userId
      userId: 'MASTER_ID',                  // Sécurité supplémentaire
      email: 'ab.thiongane@qualisoft.sn',
      role: 'SUPER_ADMIN',                  // Requis par ton MasterGuard
      username: 'Abdoulaye',                // Parfois requis par Passport
      iat: Math.floor(Date.now() / 1000),   // Issued At

    });
  });

  afterAll(async () => {
    // Nettoyage sécurisé
    try {
      await prisma.tenant.deleteMany({ where: { T_Domain: 'test-org' } });
    } catch (e) {
      // Ignore si le tenant n'a pas été créé
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('🚀 [SUCCESS] Devrait sceller un nouveau Tenant (Transaction Complète)', async () => {
    const payload = {
      companyName: 'TEST ORG',
      domain: 'test-org',
      admin1Email: 'admin1@test-org.sn',
      admin2Email: 'admin2@test-org.sn',
      defaultPassword: 'Qualisoft@2026'
    };

    const response = await request(app.getHttpServer())
      .post('/api/admin/matrix/initialize')
      .set('Authorization', `Bearer ${masterToken}`)
      .send(payload);

    // Si on reçoit encore un 404 ici, c'est que la route n'est pas chargée dans AppModule
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);

    // 🕵️ AUDIT BASE DE DONNÉES (Respect des Radicales T_, S_, U_)
    const tenant = await prisma.tenant.findUnique({
      where: { T_Domain: 'test-org' },
      include: { 
        T_Users: true, 
        T_Sites: true 
      }
    });

    expect(tenant).toBeDefined();
    expect(tenant?.T_Name).toBe(payload.companyName);
    expect(tenant?.T_Users.length).toBe(2);
    expect(tenant?.T_Sites.length).toBe(1);
  });

  it('🛑 [FAILURE] Devrait rejeter un domaine déjà scellé', async () => {
    const payload = {
      companyName: 'DUPLICATE',
      domain: 'test-org',
      admin1Email: 'fake@test.sn',
      admin2Email: 'fake2@test.sn'
    };

    const response = await request(app.getHttpServer())
      .post('/api/admin/matrix/initialize')
      .set('Authorization', `Bearer ${masterToken}`)
      .send(payload);

    expect(response.status).toBe(409);
  });
});