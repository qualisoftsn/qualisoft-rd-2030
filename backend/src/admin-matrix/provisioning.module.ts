import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminService } from '../admin/admin.service';
import { SuperAdminController } from '../admin/super-admin.controller';
import { BackupTaskService } from '../admin/tasks/backup-task.service';
import { EmailModule } from '../common/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminMatrixController } from './admin-matrix.controller';
import { ProvisioningController } from './provisioning.controller';
import { ProvisioningService } from './provisioning.service';

@Global()
@Module({
  imports: [
    PrismaModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'QUALISOFT_MASTER_SECRET_2030',
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [
    ProvisioningController,
    SuperAdminController,
    AdminMatrixController
  ],
  providers: [
    ProvisioningService,
    AdminService,
    BackupTaskService
  ],
  exports: [
    ProvisioningService,
    AdminService
  ],
})
export class ProvisioningModule {}