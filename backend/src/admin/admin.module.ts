import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { ProvisioningService } from './provisioning.service';
import { ProvisioningController } from './provisioning.controller';
import { BackupTaskService } from './tasks/backup-task.service';
import { CommonModule } from '../common/common.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    CommonModule, 
    PrismaModule, 
    AuthModule
  ],
  controllers: [
    AdminController, 
    ProvisioningController
  ],
  providers: [
    AdminService, 
    ProvisioningService, 
    BackupTaskService
  ],
  exports: [AdminService, ProvisioningService]
})
export class AdminModule {}