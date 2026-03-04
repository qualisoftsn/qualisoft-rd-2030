/**
 * 🛰️ ADMIN MATRIX MODULE - QUALISOFT ELITE RD-2026 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Enregistrement des dépendances d'administration globale.
 * FIX : Résolution du crash DI en remplaçant AdminService par AdminMatrixService.
 * RÉVISION : 04 Mars 2026 | 18:00 GMT
 * -------------------------------------------------------------------------
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// ✅ FIX : Importation correcte du contrôleur et des services avec les noms exacts
import { AdminMatrixController } from './admin-matrix.controller';
import { AdminMatrixService } from './admin-matrix.service'; 
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
  controllers: [
    AdminMatrixController
  ],
  providers: [
    // ✅ FIX : Déclaration de AdminMatrixService (et non AdminService)
    AdminMatrixService, 
    MatrixProvisioningService,
    EmailService
  ],
  exports: [
    // ✅ FIX : Exportation pour utilisation externe si nécessaire
    AdminMatrixService, 
    MatrixProvisioningService
  ]
})
export class AdminMatrixModule {}