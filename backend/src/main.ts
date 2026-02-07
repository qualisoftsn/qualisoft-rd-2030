import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

/**
 * 🚀 BOOTSTRAP : Initialisation du Noyau Qualisoft Elite
 * Référentiel ISO 9001 - Maîtrise de l'environnement opérationnel
 */
async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  
  // 🏛️ Création de l'application avec le moteur Express
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 🌍 ROUTAGE : Préfixe global pour toutes les routes API
  app.setGlobalPrefix('api');

  // 🛡️ SÉCURITÉ & VALIDATION : Protection des entrées (§8.4)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { 
        enableImplicitConversion: true 
      },
    }),
  );

  // 📂 RESSOURCES : Gestion des fichiers statiques (Uploads/Preuves/Logo)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false,
  });

  // 🔐 CORS : Configuration pour écosystème Multi-Tenant
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://elite.qualisoft.sn',
      'https://qualisoft.sn'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'x-tenant-id', 
      'X-Tenant-ID'
    ],
  });

  // 📡 DÉPLOIEMENT : Extraction du Port depuis ConfigService
  const port = configService.get<number>('PORT') || 9000;
  
  // On écoute sur 0.0.0.0 pour garantir l'accès via le réseau Docker
  await app.listen(port, '0.0.0.0');
  
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL (2026)`);
  logger.log(`📡 API BASE URL            : http://localhost:${port}/api`);
  logger.log(`📂 GESTION DES UPLOADS     : http://localhost:${port}/uploads`);
  logger.log(`🛡️  SÉCURITÉ MULTI-TENANT   : ACTIVÉE (x-tenant-id)`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();