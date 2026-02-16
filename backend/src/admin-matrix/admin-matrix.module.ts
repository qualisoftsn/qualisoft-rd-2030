/**
 * 🛰️ ADMIN MATRIX MODULE - QUALISOFT ELITE RD 2030
 * CHEMIN : /backend/src/admin-matrix/admin-matrix.module.ts
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminMatrixController } from './admin-matrix.controller';
import { AdminService } from './admin.service'; 
import { MatrixProvisioningService } from './matrix-provisioning.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule, // Indispensable pour lire le JWT_SECRET
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'QUALISOFT_2026_SECRET',
        signOptions: { expiresIn: '8h' }, // Session longue pour la Matrix
      }),
    }),
  ],
  controllers: [AdminMatrixController],
  providers: [
    AdminService,
    MatrixProvisioningService, // On utilise le service scellé
    EmailService
  ],
  exports: [
    AdminService, 
    MatrixProvisioningService
  ]
})
export class AdminMatrixModule {}