/**
 * 🛰️ NOYAU SOUVERAIN - QUALISOFT ELITE RD 2030
 * VERSION : 2.1.2 (Optimisation CORS Multi-Tenant & Scellage Sécurisé)
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

// 🛡️ IMPORTATION SÉCURISÉE DU COOKIE PARSER
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const logger = new Logger('Matrix-Bootstrap');
  
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE DE SESSION ET COOKIES
    app.use(cookieParser());

    // 🚩 PRÉFIXE GLOBAL DE L'API
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES (PIPE GLOBAL)
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

    // 📂 GESTION DES ASSETS STATIQUES (Uploads documents/signatures)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS : SOUVERAINETÉ MULTI-TENANT
    // Cette configuration permet à tous les sous-domaines .qualisoft.sn de communiquer avec l'API
    app.enableCors({
      origin: (origin, callback) => {
        const env = configService.get('NODE_ENV');
        const allowedUrls = configService.get<string>('FRONTEND_URL')?.split(',') || [];
        
        // Autorisation : 
        // 1. Si pas d'origine (app mobile ou curl)
        // 2. Si l'origine finit par .qualisoft.sn
        // 3. Si l'origine est dans la liste FRONTEND_URL
        // 4. Si on est en mode développement
        const isAllowed = 
          !origin || 
          origin.endsWith('.qualisoft.sn') || 
          origin === 'https://qualisoft.sn' ||
          allowedUrls.includes(origin) ||
          env === 'development';

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.error(`🛑 CORS BLOQUÉ : Tentative d'accès depuis une origine non autorisée : ${origin}`);
          callback(new Error('Accès refusé par le protocole CORS Qualisoft'));
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

    // 🚀 LANCEMENT DU SERVEUR
    const port = configService.get<number>('PORT') || 9000;
    await app.listen(port, '0.0.0.0');
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 NOYAU QUALISOFT ELITE : OPÉRATIONNEL SUR PORT ${port}`);
    logger.log(`🌐 DOMAINES : *.qualisoft.sn AUTORISÉS`);
    logger.log(`📡 API BASE URL : https://api.qualisoft.sn/api`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur critique lors du bootstrap';
    logger.error(`❌ ÉCHEC DU DÉMARRAGE DU NOYAU : ${message}`);
    process.exit(1);
  }
}

bootstrap();