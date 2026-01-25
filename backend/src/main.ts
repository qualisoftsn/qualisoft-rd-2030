import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  
  // Utilisation de NestExpressApplication pour le support des fichiers statiques (GED)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ======================================================
  // 1. PRÉFIXE GLOBAL & VERSIONING
  // ======================================================
  app.setGlobalPrefix('api');

  // ======================================================
  // 2. SÉCURITÉ & VALIDATION (ISO Compliance)
  // ======================================================
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // Supprime les propriétés non listées dans les DTO
    forbidNonWhitelisted: false,    // Souplesse pour les payloads frontend complexes
    transform: true,               // Conversion automatique (ex: string -> number)
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // ======================================================
  // 3. GESTION DE LA GED (Fichiers Statiques)
  // Permet l'accès aux preuves et documents SMI
  // ======================================================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/', 
    index: false,        // Sécurité : empêche l'exploration du dossier
  });

  // ======================================================
  // 4. CONFIGURATION CORS ELITE (Multi-tenant ready)
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
    // ✅ CRUCIAL : Ajout de X-Tenant-ID pour permettre l'isolation des données
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Tenant-ID'],
  });

  // ======================================================
  // 5. LANCEMENT DU NOYAU
  // ======================================================
  const port = 9000;
  await app.listen(port);
  
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL`);
  logger.log(`📡 API BASE URL     : http://localhost:${port}/api`);
  logger.log(`📂 GED STORAGE      : http://localhost:${port}/uploads`);
  logger.log(`🔐 AUTH ENDPOINT    : http://localhost:${port}/api/auth/login`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();