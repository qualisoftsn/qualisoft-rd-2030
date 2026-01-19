import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AnalysesService } from './analyses.service';

@Controller('analyses')
@UseGuards(JwtAuthGuard)
export class AnalysesController {
  constructor(
    private prisma: PrismaService,
    private readonly analysesService: AnalysesService
  ) {}

  /**
   * 📊 PERFORMANCE SSE : RÉPARTITION ET TAUX
   */
  @Get('performance-sse')
  async getSSEPerformance(@Query('year') year: string, @Request() req: any) {
    const T_Id = req.user.tenantId;
    const targetYear = parseInt(year) || new Date().getFullYear();

    const stats = await this.prisma.sSEStats.findFirst({
      where: { tenantId: T_Id, ST_Annee: targetYear }
    });

    const repartition = await this.prisma.sSEEvent.groupBy({
      by: ['SSE_SiteId'],
      where: { tenantId: T_Id },
      _count: true
    });

    const repartitionSite = await Promise.all(repartition.map(async (r) => {
      const site = await this.prisma.site.findUnique({ where: { S_Id: r.SSE_SiteId } });
      return { name: site?.S_Name || 'Inconnu', value: r._count };
    }));

    return {
      tf: stats?.ST_TauxFrequence || 0,
      tg: stats?.ST_TauxGravite || 0,
      repartitionSite
    };
  }

  /**
   * 📈 DASHBOARD COCKPIT : VUE CONSOLIDÉE ÉLITE
   */
  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.analysesService.getDashboardStats(req.user.tenantId);
  }
}