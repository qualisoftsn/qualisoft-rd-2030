/**
 * 🛰️ ADMIN MODULE - QUALISOFT ELITE RD-2026 (elite-sde)
 * -------------------------------------------------------------------------
 * RÔLE : Dépôt central des fonctionnalités d'administration.
 * FIX : Nettoyage strict des providers pour éviter les boucles circulaires.
 * -------------------------------------------------------------------------
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { SuperAdminController } from './super-admin.controller';
import { AdminService } from './admin.service';
import { BackupTaskService } from './tasks/backup-task.service';

// On importe le ProvisioningModule (et non le Service direct) pour éviter l'erreur d'instanciation
import { ProvisioningModule } from '../admin-matrix/provisioning.module';

@Module({
  imports: [
    CommonModule, 
    PrismaModule, 
    AuthModule,
    ProvisioningModule // ✅ Import propre de la fonctionnalité de Provisioning
  ],
  controllers: [
    AdminController, 
    SuperAdminController, 
  ],
  providers: [
    AdminService, 
    BackupTaskService
  ],
  exports: [AdminService]
})
export class AdminModule {}