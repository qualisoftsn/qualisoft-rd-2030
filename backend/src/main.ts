/**
 * 🛰️ NOYAU SOUVERAIN - QUALISOFT ELITE RD 2030
 * VERSION : 2.1.1 (Correction Typage CookieParser)
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// 🛡️ CORRECTION : Importation compatible CommonJS/ESM
import cookieParser from 'cookie-parser'; 

async function bootstrap() {
  const logger = new Logger('Matrix-Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE DE SESSION (Ligne 23 désormais valide)
    app.use(cookieParser());

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
          }));
          return new BadRequestException({
            statusCode: 400,
            message: formattedErrors,
            error: 'Bad Request',
          });
        },
      }),
    );

    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS : SOUVERAINETÉ MULTI-TENANT
    app.enableCors({
      origin: (origin, callback) => {
        const isDev = configService.get('NODE_ENV') === 'development';
        // On autorise qualisoft.sn et tous ses sous-domaines (*.qualisoft.sn)
        if (!origin || origin.endsWith('.qualisoft.sn') || origin === 'https://qualisoft.sn' || isDev) {
          callback(null, true);
        } else {
          logger.error(`🛑 CORS BLOQUÉ : ${origin}`);
          callback(new Error('Non autorisé par la Matrix CORS'));
        }
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant-domain', 'Cookie'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    const port = configService.get<number>('PORT') || 9000;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 NOYAU QUALISOFT ELITE : OPÉRATIONNEL SUR PORT ${port}`);
    logger.log(`🌐 CORS : ACCÈS SOUS-DOMAINES CONFIGURÉ`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    logger.error(`❌ ÉCHEC DU DÉMARRAGE : ${message}`);
    process.exit(1);
  }
}

bootstrap();