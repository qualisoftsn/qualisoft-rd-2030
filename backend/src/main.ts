/**
 * CHEMIN ABSOLU : /backend/src/main.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Point d'entrée souverain du Noyau Backend (Multi-Tenant Ready).
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// 🛡️ IMPORTATION COOKIE-PARSER
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE COOKIES
    app.use(cookieParser());

    // 🛰️ PRÉFIXE GLOBAL
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES
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

    // 📁 GESTION DES ASSETS
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS : CORRIGÉE POUR LE MASTER ET SDE
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOriginPatterns = [
          /^http:\/\/localhost:\d+$/,
          /^https:\/\/qualisoft\.sn$/,
          /^https:\/\/.*\.qualisoft\.sn$/ // Autorise app.qualisoft.sn, sde..., elite...
        ];

        if (!origin || allowedOriginPatterns.some(pattern => pattern.test(origin))) {
          callback(null, true);
        } else {
          logger.warn(`🚫 CORS Bloqué pour l'origine : ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: [
        'Content-Type', 
        'Accept', 
        'Authorization', 
        'x-tenant-id',     // Identifiant ID
        'X-Tenant-ID',
        // ✅ LES SAUVEURS (Indispensables pour que SDE et Master fonctionnent)
        'x-tenant-domain', // Identifiant Domaine (ex: sde)
        'X-Tenant-Domain'
      ],
    });

    // 🔌 DÉTERMINATION DU PORT
    const port = configService.get<number>('PORT') || 9000;
    
    // 🚀 MISE EN ÉCOUTE
    await app.listen(port, '0.0.0.0');
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL (2026)`);
    logger.log(`📡 API BASE URL            : http://0.0.0.0:${port}/api`);
    logger.log(`🌐 CORS MULTI-TENANT       : FULL ACCESS (Headers OK)`);
    logger.log(`🛰️ INFRASTRUCTURE          : DOCKER SOUVERAIN`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    logger.error(`❌ ÉCHEC CRITIQUE AU DÉMARRAGE : ${errorMessage}`);
    process.exit(1);
  }
}

bootstrap();