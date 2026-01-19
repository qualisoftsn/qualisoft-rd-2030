import { Module } from '@nestjs/common';
import { EnvironmentService } from './environment.service';
import { EnvironmentController } from './environment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PkiService } from '../pki/pki.service'; // Assure-toi que le PkiModule est importé ou exporté correctement

@Module({
  imports: [PrismaModule],
  controllers: [EnvironmentController],
  providers: [EnvironmentService, PkiService],
  exports: [EnvironmentService]
})
export class EnvironmentModule {}