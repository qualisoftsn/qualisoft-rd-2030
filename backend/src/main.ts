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
  // Exemple : http://localhost:9000/api/auth/login
  app.setGlobalPrefix('api');

  // 🛡️ SÉCURITÉ & VALIDATION : Protection des entrées (§8.4)
  // Ce Pipe s'assure que les données entrantes respectent strictement les DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Sécurité : Rejette les propriétés non définies dans les DTOs
      forbidNonWhitelisted: false,   // Flexibilité : Ne lance pas d'erreur, nettoie juste l'objet
      transform: true,               // DX : Auto-conversion des types (ex: string "1" -> number 1)
      transformOptions: { 
        enableImplicitConversion: true 
      },
    }),
  );

  // 📂 RESSOURCES : Gestion des fichiers statiques (Uploads/Preuves)
  // Permet d'accéder aux fichiers via http://localhost:9000/uploads/nom-fichier.pdf
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false, // Sécurité : Empêche le listing des fichiers du dossier
  });

  // 🔐 CORS : Configuration multi-environnements et Multi-Tenancy
  // On autorise explicitement les headers nécessaires pour le frontend et le tenant
  app.enableCors({
    origin: [
      'http://localhost:3000',      // Frontend Dev 1
      'http://localhost:3001',      // Frontend Dev 2
      'https://elite.qualisoft.sn'  // Production
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type', 
      'Accept', 
      'Authorization', 
      'x-tenant-id', // Header critique pour le multi-tenant (minuscule standard)
      'X-Tenant-ID'  // Variante majuscule (sécurité compatibilité)
    ],
  });

  // 📡 DÉPLOIEMENT : Écoute sur le port configuré ou 9000 par défaut
  const port = configService.get<number>('PORT') || 9000;
  
  await app.listen(port);
  
  // 📜 LOGS DE SORTIE : Confirmation de l'état souverain
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL (2026)`);
  logger.log(`📡 API BASE URL            : http://localhost:${port}/api`);
  logger.log(`📂 UPLOADS                 : http://localhost:${port}/uploads`);
  logger.log(`🛡️  CORS                   : CONFIGURÉ POUR MULTI-TENANCY`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();