import { Injectable } from '@nestjs/common';
import { AnalysesService } from './analyses.service';

@Injectable()
export class EmailReportService {
  constructor(private readonly analysesService: AnalysesService) {}

  async generateAndSend(tenantId: string) {
    const stats = await this.analysesService.getDashboardStats(tenantId);
    // Logique d'envoi d'email...
    return stats;
  }
}