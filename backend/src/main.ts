import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. PRÉFIXE GLOBAL
  // Toutes les URLs seront : http://localhost:9000/api/...
  app.setGlobalPrefix('api');

  // 2. PIPES DE VALIDATION (Strict pour la sécurité, mais flexible pour le dev)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,               // Supprime les données qui ne sont pas dans le DTO
    forbidNonWhitelisted: false,    // Évite de planter si le front envoie un champ en trop
    transform: true,               // Transforme les types (ex: string vers number)
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // 3. FICHIERS STATIQUES (Documents, Preuves, Photos)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // 4. CONFIGURATION CORS ROBUSTE (MULTI-PORTS)
  // On autorise 3000 et 3001 pour couvrir Next.js quel que soit son port
  app.enableCors({
    origin: [
      //'http://localhost:3000', 
      //'http://localhost:3001', 
      'https://elite.qualisoft.sn:3000', 
      'https://elite.qualisoft.sn:3001'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // 5. LANCEMENT SUR LE PORT 9000
  const port = 9000;
  await app.listen(port);
  
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : DÉPLOYÉ`);
  logger.log(`📡 POINT D'ENTRÉE : http://localhost:${port}/api`);
  logger.log(`🔐 AUTHENTIFICATION : http://localhost:${port}/api/auth/login`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();