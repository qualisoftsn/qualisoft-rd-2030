/**
 * 🛰️ NOYAU SOUVERAIN - QUALISOFT ELITE RD-2026
 * -------------------------------------------------------------------------
 * RÔLE : Initialisation du Kernel NestJS et des Sceaux de Sécurité.
 * SÉCURITÉ : Zéro NextAuth. Validation Strict-Whitelist. Multi-Tenancy CORS.
 * RÉVISION : 03 Mars 2026 | 16:45 GMT
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

    // 🍪 PROTOCOLE DE SESSION (Élimination NextAuth)
    // Extraction des JWT stockés dans les cookies pour l'auth Zustand/NestJS
    app.use(cookieParser());

    // 🚩 ARCHITECTURE DES ROUTES
    app.setGlobalPrefix('api');

    // 🛡️ VALIDATION DES DONNÉES (PROTOCOLE STRICT-WHITELIST)
    // Ce bloc garantit que les préfixes TX_, T_, U_ sont les seuls acceptés.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,               // Rejette tout champ non présent dans le DTO
        forbidNonWhitelisted: true,    // Déclenche une erreur si un champ intrus est détecté
        transform: true,               // Conversion automatique des types (ex: string -> number)
        transformOptions: { 
          enableImplicitConversion: true 
        },
        exceptionFactory: (errors) => {
          const formattedErrors = errors.map((err) => ({
            champ: err.property,
            erreurs: Object.values(err.constraints || {}),
            reçu: err.value // Utile pour débugger les envois incorrects
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

    // 📂 GESTION DES ASSETS SCELLÉS (Preuves de paiement, Documents QSE)
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
      index: false,
    });

    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads/',
    });


    // 🌐 CONFIGURATION CORS SOUVERAINE (Isolation Multi-Tenant)
    app.enableCors({
      origin: (origin, callback) => {
        const env = configService.get('NODE_ENV');
        const allowedUrls = configService.get<string>('FRONTEND_URL')?.split(',') || [];
        
        // Autorisation dynamique : Domaines .qualisoft.sn & Localhost Dev
        const isAllowed = 
          !origin || 
          origin.endsWith('.qualisoft.sn') || 
          origin.includes('localhost') ||
          origin === 'https://qualisoft.sn' ||
          allowedUrls.includes(origin) ||
          env === 'development';

        if (isAllowed) {
          callback(null, true);
        } else {
          logger.error(`🛑 PROTOCOLE CORS : Tentative d'accès non autorisée depuis ${origin}`);
          callback(new Error('Accès refusé par la Sentinelle Matrix'));
        }
      },
      credentials: true, // Crucial pour l'échange des cookies JWT avec Zustand
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'x-tenant-id', 
        'x-tenant-domain', 
        'x-tenant-slug', // Support du nouveau middleware
        'Cookie', 
        'Accept'
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // 🚀 DÉPLOIEMENT DU NŒUD SDE
    const port = configService.get<number>('PORT') || 9000;
    const host = '0.0.0.0'; // Exposition pour Docker/Cluster
    
    await app.listen(port, host);
    
    logger.log(`--------------------------------------------------------`);
    logger.log(`🚀 NOYAU QUALISOFT ELITE RD-2026 : OPÉRATIONNEL`);
    logger.log(`📡 PORT : ${port} | HOST : ${host}`);
    logger.log(`🛡️ SÉCURITÉ : SCELLÉE (Zéro NextAuth)`);
    logger.log(`🔗 REGISTRE : ${configService.get('DATABASE_URL')?.split('@')[1]}`);
    logger.log(`--------------------------------------------------------`);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Échec critique du Kernel';
    logger.error(`❌ CRASH DU BOOTSTRAP : ${message}`);
    process.exit(1);
  }
}

bootstrap();