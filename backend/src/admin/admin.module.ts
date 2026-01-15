import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BackupTaskService } from './tasks/backup-task.service';
import { CommonModule } from '../common/common.module'; // ✅ Importation du module commun

@Module({
  imports: [CommonModule], // ✅ Indispensable pour injecter EmailService
  controllers: [AdminController],
  providers: [AdminService, BackupTaskService],
  exports: [AdminService]
})
export class AdminModule {}