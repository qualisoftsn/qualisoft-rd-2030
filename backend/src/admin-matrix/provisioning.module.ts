/**
 * 🛰️ PROVISIONING MODULE (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Isolation de la logique de création des nœuds (Big Bang).
 * -------------------------------------------------------------------------
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'QUALISOFT_MASTER_SECRET_2030',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [
    ProvisioningController
  ],
  providers: [
    ProvisioningService
  ],
  exports: [
    ProvisioningService // Exporté pour être utilisé par AdminModule/SuperAdminController
  ],
})
export class ProvisioningModule {}