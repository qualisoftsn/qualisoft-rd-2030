/**
 * 🛰️ NOYAU SOUVERAIN - QUALISOFT ELITE RD-2026
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation du Kernel NestJS et des Sceaux de Sécurité.
 * RÉVISION : 03 Mars 2026 | 05:05 GMT
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// ✅ IMPORTATION ROBUSTE (Évite l'erreur app.use)
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Matrix-Bootstrap');
  
  try {
    // Initialisation avec le moteur Express pour supporter cookieParser
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE DE SESSION (Fix Ligne 12)
    // On s'assure que cookieParser est bien une fonction avant l'injection
    app.use(cookieParser());

    // 🚩 CONFIGURATION GLOBALE
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES (PROTOCOLE STRICT)
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
          }));
          return new BadRequestException({
            statusCode: 400,
            message: formattedErrors,
            error: 'Erreur de validation Matrix',
          });
        },
      }),
    );

    // 📂 GESTION DES ASSETS SCELLÉS (Uploads)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS SOUVERAINE (Multi-Tenant)
    app.enableCors({
      origin: (origin, callback) => {
        const env = configService.get('NODE_ENV');
        const allowedUrls = configService.get<string>('FRONTEND_URL')?.split(',') || [];
        
        // Autorisation dynamique pour les sous-domaines .qualisoft.sn
        const isAllowed = 
          !origin || 
          origin.endsWith('.qualisoft.sn') || 
          origin === 'https://qualisoft.sn' ||
          allowedUrls.includes(origin) ||
          env === 'development';

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.error(`🛑 CORS BLOQUÉ : Tentative d'intrusion depuis ${origin}`);
          callback(new Error('Accès refusé par le protocole Matrix'));
        }
      },
      credentials: true,
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'x-tenant-id', 
        'x-tenant-domain', 
        'Cookie', 
        'Accept'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // 🚀 LANCEMENT DU NŒUD SDE
    const port = configService.get<number>('PORT') || 9000;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 NOYAU QUALISOFT ELITE : OPÉRATIONNEL SUR PORT ${port}`);
    logger.log(`📡 ÉTAT DU SYSTÈME : SCELLÉ ET SOUVERAIN`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Échec critique';
    logger.error(`❌ CRASH DU BOOTSTRAP : ${message}`);
    process.exit(1);
  }
}

bootstrap();