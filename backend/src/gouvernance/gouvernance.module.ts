import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GouvernanceController } from './gouvernance.controller';
import { GouvernanceService } from './gouvernance.service';

@Module({
  imports: [PrismaModule],
  controllers: [GouvernanceController],
  providers: [GouvernanceService],
  exports: [GouvernanceService] // ✅ Important
})
export class GouvernanceModule {}