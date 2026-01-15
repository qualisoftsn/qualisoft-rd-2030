import { Controller, Get, UseGuards } from '@nestjs/common';
import { KpiService } from './kpi.service';

// ON REMONTE DE DEUX NIVEAUX : 
// 1er '../' sort de 'stats', 2ème '../' sort de 'modules'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';;@Controller('stats')
@UseGuards(JwtAuthGuard)
export class KpiController {
  constructor(private readonly kpiService: KpiService) {}

  @Get('dashboard-summary')
  async getSummary(@GetUser() user: any) {
    // Isolation stricte : on utilise le TenantId injecté par le JWT
    return this.kpiService.getGlobalStats(user.tenantId);
  }
}