import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('analyses')
@UseGuards(JwtAuthGuard)
export class AnalysesController {
  constructor(private prisma: PrismaService) {}

  @Get('performance-sse')
  async getSSEPerformance(@Query('year') year: string, @Request() req) {
    const T_Id = req.user.tenantId;
    const targetYear = parseInt(year) || 2025;

    // 1. Récupérer les stats globales du Tenant (Table SSEStats de ton schéma)
    const stats = await this.prisma.sSEStats.findFirst({
      where: { tenantId: T_Id, ST_Annee: targetYear }
    });

    // 2. Récupérer la répartition par site
    const repartition = await this.prisma.sSEEvent.groupBy({
      by: ['SSE_SiteId'],
      where: { tenantId: T_Id },
      _count: true
    });

    // On transforme pour le format attendu par Recharts
    const repartitionSite = await Promise.all(repartition.map(async (r) => {
      const site = await this.prisma.site.findUnique({ where: { S_Id: r.SSE_SiteId } });
      return { name: site?.S_Name || 'Inconnu', value: r._count };
    }));

    return {
      tf: stats?.ST_NbAccidents || 0,
      tg: stats?.ST_Annee || 0,
      pyramidRatio: 29, // Exemple statique ou calculé
      monthlyStats: [
        { month: 'Jan', accidents: 2, presquAccidents: 5 },
        { month: 'Fév', accidents: 1, presquAccidents: 8 },
        // ... Logique à compléter selon tes besoins de calcul
      ],
      repartitionSite
    };
  }
}