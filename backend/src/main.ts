/**
 * CHEMIN ABSOLU : /backend/src/main.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Point d'entrée souverain du Noyau Backend (Multi-Tenant Ready).
 * VERSION : 2.0.1 (CORS & Cookie Domain Optimized)
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// 🛡️ IMPORTATION COOKIE-PARSER pour la gestion des sessions Matrix
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE COOKIES : Indispensable pour la persistance des sessions sur *.qualisoft.sn
    app.use(cookieParser());

    // 🛰️ PRÉFIXE GLOBAL : Toutes les routes sont servies sous /api
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES (Scellage DTO avec transformation automatique)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((err) => ({
            champ: err.property,
            erreurs: Object.values(err.constraints || {}),
            valeurRecue: err.value,
          }));
          
          logger.error(`❌ ERREUR VALIDATION : ${JSON.stringify(formattedErrors)}`);
          
          return new BadRequestException({
            statusCode: 400,
            message: formattedErrors,
            error: 'Bad Request',
          });
        },
      }),
    );

    // 📁 GESTION DES ASSETS : Stockage des documents et images (Uploads)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS : CORRIGÉE POUR LE WORKFLOW SOUS-DOMAINE (SDE, MASTER, ETC.)
    app.enableCors({
      origin: true, // 👈 Autorise TOUT temporairement pour débloquer
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant-domain'],
    });


    // app.enableCors({
    //   origin: (origin, callback) => {
    //     // Autorise Localhost, le domaine maître et tous les sous-domaines dynamiques
    //     const allowedOriginPatterns = [
    //       /^http:\/\/localhost:\d+$/,
    //       /^https:\/\/qualisoft\.sn$/,
    //       /^https:\/\/.*\.qualisoft\.sn$/ 
    //     ];

    //     if (!origin || allowedOriginPatterns.some(pattern => pattern.test(origin))) {
    //       callback(null, true);
    //     } else {
    //       logger.warn(`🚫 CORS Bloqué pour l'origine : ${origin}`);
    //       callback(new Error('Not allowed by CORS'));
    //     }
    //   },
    //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    //   credentials: true, // Crucial pour autoriser l'envoi des cookies de session
    //   allowedHeaders: [
    //     'Content-Type', 
    //     'Accept', 
    //     'Authorization', 
    //     'x-tenant-id',     // Identifiant par ID (UUID)
    //     'X-Tenant-ID',
    //     'x-tenant-domain', // Identifiant par sous-domaine (ex: sde)
    //     'X-Tenant-Domain'
    //   ],
    // });

    // 🔌 DÉTERMINATION DU PORT (Priorité aux variables d'environnement Docker)
    const port = configService.get<number>('PORT') || 9000;
    
    // 🚀 MISE EN ÉCOUTE : Écoute sur toutes les interfaces pour Docker
    await app.listen(port, '0.0.0.0');
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL (2026)`);
    logger.log(`📡 API BASE URL            : http://0.0.0.0:${port}/api`);
    logger.log(`🌐 CORS MULTI-TENANT       : FULL ACCESS (*.qualisoft.sn)`);
    logger.log(`🛰️ INFRASTRUCTURE          : DOCKER SOUVERAIN`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    logger.error(`❌ ÉCHEC CRITIQUE AU DÉMARRAGE : ${errorMessage}`);
    process.exit(1);
  }
}

bootstrap();