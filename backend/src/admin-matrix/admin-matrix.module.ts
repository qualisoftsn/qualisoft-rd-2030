import { Module } from '@nestjs/common';
import { AdminMatrixController } from './admin-matrix.controller';
import { AdminService } from './admin.service'; // ✅ Import relatif direct
import { ProvisioningService } from './provisioning.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'QUALISOFT_2026_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AdminMatrixController],
  providers: [
    AdminService, // ✅ IL DOIT ETRE LA
    ProvisioningService,
    EmailService
  ],
  exports: [AdminService, ProvisioningService]
})
export class AdminMatrixModule {}