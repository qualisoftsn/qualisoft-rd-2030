/**
 * 🛰️ NOYAU SOUVERAIN - QUALISOFT ELITE RD-2026 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation du Kernel NestJS et des Sceaux de Sécurité.
 * SÉCURITÉ : Zéro NextAuth. Validation Strict-Whitelist. Multi-Tenancy CORS.
 * FIX : Ajout du header 'X-Skip-Interceptor' vital pour le SAS Login Frontend.
 * RÉVISION : 08 Mars 2026 | 23:45 GMT
 * -------------------------------------------------------------------------
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// ✅ SÉCURITÉ : Importation robuste du parser de cookies pour l'auth souveraine
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Matrix-Bootstrap');
  
  try {
    // 🏗️ Initialisation du moteur Express (Soutien des Sceaux Statiques & Cookies)
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    const configService = app.get(ConfigService);

    // 🍪 PROTOCOLE DE SESSION (Élimination Définitive de NextAuth)
    // Extraction des JWT stockés dans les cookies HttpOnly pour l'auth Zustand/NestJS
    app.use(cookieParser());

    // 🚩 ARCHITECTURE DES ROUTES
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES (PROTOCOLE STRICT-WHITELIST)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,               // Rejette tout champ non présent dans le DTO
        forbidNonWhitelisted: true,    // Déclenche une erreur si un champ intrus est détecté
        transform: true,               // Conversion automatique des types
        transformOptions: { 
          enableImplicitConversion: true 
        },
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((err) => ({
            champ: err.property,
            erreurs: Object.values(err.constraints || {}),
            reçu: err.value 
          }));
          
          logger.warn(`⚠️ TENTATIVE D'INTRUSION DE DONNÉES : ${JSON.stringify(formattedErrors)}`);
          
          return new BadRequestException({
            statusCode: 400,
            error: 'Erreur de validation Matrix',
            message: formattedErrors,
            timestamp: new Date().toISOString(),
          });
        },
      }),
    );

    // 📂 GESTION DES ASSETS SCELLÉS
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    // 🌐 CONFIGURATION CORS SOUVERAINE (Isolation Multi-Tenant Parfaite)
    app.enableCors({
      origin: (origin, callback) => {
        const env = configService.get('NODE_ENV');
        const allowedUrls = configService.get<string>('FRONTEND_URL')?.split(',') || [];
        
        // Regex stricte pour autoriser qualisoft.sn ET tous ses sous-domaines
        const qualisoftRegex = /^https:\/\/([a-zA-Z0-9-]+\.)?qualisoft\.sn$/;
        
        // Autorisation dynamique SDE
        const isAllowed = 
          !origin || // Autorise les requêtes Postman/Serveur-à-Serveur
          qualisoftRegex.test(origin) || // Validation Regex infaillible pour les locataires
          origin.startsWith('http://localhost') || // Autorise le dev local
          allowedUrls.includes(origin) ||
          env === 'development';

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.warn(`🛑 PROTOCOLE CORS : Origine bloquée proprement -> ${origin}`);
          // Évite le crash silencieux du socket et l'erreur 502 Bad Gateway sur Nginx
          callback(null, false);
        }
      },
      credentials: true, // Crucial pour l'échange des cookies JWT avec Zustand
      
      // ✅ FIX VITAL : Ajout de X-Skip-Interceptor pour le Frontend
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'x-tenant-id', 
        'x-tenant-domain', 
        'x-tenant-slug',
        'X-Skip-Interceptor', // <--- LA CLÉ EST ICI
        'Cookie', 
        'Accept'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // 🚀 DÉPLOIEMENT DU NŒUD SDE
    const port = configService.get<number>('PORT') || 9000;
    const host = '0.0.0.0'; 
    
    await app.listen(port, host);
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 NOYAU QUALISOFT ELITE RD-2026 : OPÉRATIONNEL`);
    logger.log(`📡 PORT : ${port} | HOST : ${host}`);
    logger.log(`🛡️ SÉCURITÉ : SCELLÉE (Zéro NextAuth | CORS Multi-Tenant)`);
    logger.log(`🔗 REGISTRE : ${configService.get('DATABASE_URL')?.split('@')[1]}`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Échec critique du Kernel';
    logger.error(`❌ CRASH DU BOOTSTRAP : ${message}`);
    process.exit(1);
  }
}

bootstrap();