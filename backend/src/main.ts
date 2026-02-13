/**
 * CHEMIN ABSOLU : /backend/src/main.ts
 * PROJET : Qualisoft Elite RD 2030
 * RÔLE : Point d'entrée souverain du Noyau Backend.
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// 🛡️ IMPORTATION COOKIE-PARSER (Syntaxe compatible ESM/CommonJS)
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE COOKIES : Indispensable pour la persistance des sessions Matrix
    app.use(cookieParser());

    // 🛰️ PRÉFIXE GLOBAL : Scelle toutes les routes sous le namespace /api
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES (SCELLAGE DTO)
    // Cette configuration force l'affichage des erreurs dans docker logs
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true, // Rejette les champs non définis dans le DTO
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((err) => ({
            champ: err.property,
            erreurs: Object.values(err.constraints || {}),
            valeurRecue: err.value,
          }));
          
          // 🔥 C'est ce log qui va nous sauver :
          logger.error(`❌ ERREUR VALIDATION : ${JSON.stringify(formattedErrors)}`);
          
          return new BadRequestException({
            statusCode: 400,
            message: formattedErrors,
            error: 'Bad Request',
          });
        },
      }),
    );

    // 📁 GESTION DES ASSETS : Stockage souverain (Uploads)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS : Ouverture des ponts avec le Frontend Elite
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://elite.qualisoft.sn',
        'https://api.qualisoft.sn'
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

    // 🔌 DÉTERMINATION DU PORT (Priorité Config/Docker)
    const port = configService.get<number>('PORT') || 9000;
    
    // 🚀 MISE EN ÉCOUTE : Liaison 0.0.0.0 obligatoire pour Docker
    await app.listen(port, '0.0.0.0');
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL (2026)`);
    logger.log(`📡 API BASE URL            : http://localhost:${port}/api`);
    logger.log(`🍪 COOKIE PARSER           : ACTIVÉ (§8.5.1)`);
    logger.log(`🛰️ INFRASTRUCTURE          : DOCKER SOUVERAIN`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
    logger.error(`❌ ÉCHEC CRITIQUE AU DÉMARRAGE : ${errorMessage}`);
    process.exit(1);
  }
}

bootstrap();