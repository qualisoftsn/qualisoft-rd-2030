import { Module } from '@nestjs/common';
import { KpiController } from './kpi.controller';
import { KpiService } from './kpi.service';
import { AuthModule } from '../../auth/auth.module'; // Chemin corrigé ici aussi

@Module({
  imports: [AuthModule],
  controllers: [KpiController],
  providers: [KpiService],
})
export class StatsModule {}