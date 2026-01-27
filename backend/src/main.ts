import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const logger = new Logger('Qualisoft-Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
    index: false,
  });

  // ✅ FIX CORS : On accepte les deux variantes de casse pour le header tenant
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://elite.qualisoft.sn'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'x-tenant-id', 'X-Tenant-ID'],
  });

  // ✅ PORT UNIQUE : On s'assure que le serveur écoute sur le port affiché dans les logs
  const port = configService.get('PORT') || 9000;
  await app.listen(port);
  
  logger.log(`--------------------------------------------------------`);
  logger.log(`🚀 QUALISOFT ELITE BACKEND : OPÉRATIONNEL`);
  logger.log(`📡 API BASE URL     : http://localhost:${port}/api`);
  logger.log(`--------------------------------------------------------`);
}

bootstrap();