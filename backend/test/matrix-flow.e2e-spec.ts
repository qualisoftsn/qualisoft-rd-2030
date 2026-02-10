/**
 * CHEMIN ABSOLU : /backend/test/matrix-flow.e2e-spec.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Validation du flux critique Master -> Provisioning -> Impersonation
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('🚀 QUALISOFT ELITE : MASTER FLOW E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let masterToken: string;
  let createdTenantId: string;
  let impersonationToken: string;

  const MASTER_CREDENTIALS = {
    email: 'ab.thiongane@qualisoft.sn',
    password: 'mohamed1965ab1711@@@', // Mot de passe scellé dans le seed
  };

  const NEW_TENANT_DATA = {
    companyName: 'SAGAM SENEGAL',
    domain: 'sagam',
    admin1Email: 'contact@sagam.sn',
    admin2Email: 'it@sagam.sn',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Nettoyage régalien après test
    try {
      await prisma.tenant.deleteMany({ where: { T_Domain: NEW_TENANT_DATA.domain } });
    } catch (exception: unknown) {
      console.warn('⚠️ Nettoyage post-test incomplet.');
    }
    await prisma.$disconnect();
    await app.close();
  });

  /**
   * ÉTAPE 1 : AUTHENTIFICATION MASTER
   */
  it('1. Devrait authentifier le CTO Abdoulaye (Accès Souverain)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(MASTER_CREDENTIALS);

    expect(response.status).toBe(201);
    expect(response.body.access_token).toBeDefined();
    masterToken = response.body.access_token;
  });

  /**
   * ÉTAPE 2 : PROVISIONING CLIENT
   */
  it('2. Devrait créer le Tenant SAGAM via la Matrix', async () => {
    const response = await request(app.getHttpServer())
      .post('/admin/matrix/initialize')
      .set('Authorization', `Bearer ${masterToken}`)
      .send(NEW_TENANT_DATA);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    createdTenantId = response.body.tenantId;
  });

  /**
   * ÉTAPE 3 : IMPERSONATION
   */
  it('3. Devrait générer un token d’impersonation pour SAGAM', async () => {
    const response = await request(app.getHttpServer())
      .post(`/admin/matrix/impersonate/${createdTenantId}`)
      .set('Authorization', `Bearer ${masterToken}`);

    expect(response.status).toBe(201);
    expect(response.body.access_token).toBeDefined();
    impersonationToken = response.body.access_token;
  });

  /**
   * ÉTAPE 4 : VALIDATION DE L'ISOLATION
   */
  it('4. Devrait accéder aux données de SAGAM avec le token d’impersonation', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/profile') // Ou toute route protégée par tenantId
      .set('Authorization', `Bearer ${impersonationToken}`);

    expect(response.status).toBe(200);
    expect(response.body.tenantId).toBe(createdTenantId);
    expect(response.body.isImpersonated).toBe(true);
  });
});