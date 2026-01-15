import { Module } from '@nestjs/common';
import { GouvernanceService } from './gouvernance.service';
import { GouvernanceController } from './gouvernance.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GouvernanceController],
  providers: [GouvernanceService],
  exports: [GouvernanceService] // ✅ Important
})
export class GouvernanceModule {}