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
  
  // 🏛️ Création de l'application avec le moteur Express (indispensable pour les assets statiques)
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 🌍 ROUTAGE : Préfixe global pour toutes les routes API
  // Toutes les routes seront accessibles sous /api (ex: /api/reclamations)
  app.setGlobalPrefix('api');

  // 🛡️ SÉCURITÉ & VALIDATION : Protection des entrées (§8.4)
  // Utilisation de class-validator et class-transformer pour le typage fort
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Sécurité : Supprime les propriétés non définies dans les DTOs
      forbidNonWhitelisted: false,   // Flexibilité : Nettoie l'objet sans bloquer la requête
      transform: true,               // DX : Conversion automatique des types (ex: "1" -> 1)
      transformOptions: { 
        enableImplicitConversion: true 
      },
    }),
  );

  // 📂 RESSOURCES : Gestion des fichiers statiques (Uploads/Preuves/Logo)
  // Maîtrise de l'information documentée (§7.5)
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false, // Sécurité : Empêche l'exploration des dossiers
  });

  // 🔐 CORS : Configuration pour écosystème Multi-Tenant
  // Autorisation des origines de développement et de production
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://elite.qualisoft.sn',
      'https://qualisoft.sn' // Ajouté par précaution pour la vitrine
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'x-tenant-id', // Header vital pour l'isolation des données SAGAM
      'X-Tenant-ID'
    ],
  });

  // 📡 DÉPLOIEMENT : Extraction du Port depuis ConfigService (Priorité au .env)
  const port = configService.get<number>('PORT') || 9000;
  
  await app.listen(port);
  
  // 📜 LOGS DE SORTIE : Statut de la souveraineté numérique
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL (2026)`);
  logger.log(`📡 API BASE URL            : http://localhost:${port}/api`);
  logger.log(`📂 GESTION DES UPLOADS     : http://localhost:${port}/uploads`);
  logger.log(`🛡️  SÉCURITÉ MULTI-TENANT   : ACTIVÉE (x-tenant-id)`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();