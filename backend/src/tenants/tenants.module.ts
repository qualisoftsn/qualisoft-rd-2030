import { Module } from '@nestjs/common';
import { TenantsController } from './tenants.controller';
import { TenantsService } from './tenants.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TenantsController], // Enregistre les routes (POST, GET, etc.)
  providers: [TenantsService],     // Enregistre la logique métier et Prisma
  exports: [TenantsService]        // Permet à d'autres modules (ex: Auth) d'utiliser le service
})
export class TenantsModule {}