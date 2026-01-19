import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  
  // Utilisation de NestExpressApplication pour accéder aux méthodes Express (Static Assets)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ======================================================
  // 1. PRÉFIXE GLOBAL & VERSIONING API
  // ======================================================
  app.setGlobalPrefix('api');

  // ======================================================
  // 2. SÉCURITÉ & VALIDATION (Strict ISO Compliance)
  // ======================================================
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // Nettoie les entrées non définies dans les DTO
    forbidNonWhitelisted: false,    // Souplesse pour l'intégration frontend
    transform: true,               // Conversion automatique des types (String -> Number)
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // ======================================================
  // 3. GESTION DES FLUX GED (Fichiers Statiques)
  // Résout la dette technique d'accès aux documents/preuves
  // ======================================================
  // On utilise process.cwd() pour garantir que le chemin est correct sur OVH (Docker/Linux)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', // URL d'accès : https://elite.qualisoft.sn/uploads/...
    index: false,        // Sécurité : empêche de lister les fichiers du dossier
  });

  // ======================================================
  // 4. CONFIGURATION CORS (Écosystème Qualisoft)
  // ======================================================
  app.enableCors({
    origin: [
      'http://localhost:3000', 
      'http://localhost:3001', 
      'https://elite.qualisoft.sn',
      'https://elite.qualisoft.sn:3000', 
      'https://elite.qualisoft.sn:3001'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // ======================================================
  // 5. LANCEMENT DU SERVEUR
  // ======================================================
  const port = 9000;
  await app.listen(port);
  
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL`);
  logger.log(`📡 API BASE URL      : http://localhost:${port}/api`);
  logger.log(`📂 GED STORAGE       : http://localhost:${port}/uploads`);
  logger.log(`🔐 AUTH ENDPOINT     : http://localhost:${port}/api/auth/login`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();