import { Module } from '@nestjs/common';
import { ProvisioningService } from '../admin-matrix/provisioning.service';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
//import { AdminMatrixController } from './admin-matrix.controller'; // ✅ AJOUT INDISPENSABLE
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
//import { ProvisioningController } from './provisioning.controller';
import { SuperAdminController } from './super-admin.controller';
import { BackupTaskService } from './tasks/backup-task.service';

@Module({
  imports: [CommonModule, PrismaModule, AuthModule],
  controllers: [
    AdminController, 
    SuperAdminController, 
  ],
  providers: [AdminService, ProvisioningService, BackupTaskService],
  exports: [AdminService, ProvisioningService]
})
export class AdminModule {}