import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessusSchedulerService {
  private readonly logger = new Logger(ProcessusSchedulerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleIsoComplianceScan() {
    this.logger.log('🕵️ Scan de conformité ISO/MASE en cours...');
    const now = new Date();

    // 1. Détection des retards critiques (Actions PAQ)
    const overdue = await this.prisma.action.findMany({
      where: { 
        ACT_Deadline: { lt: now }, 
        ACT_Status: { notIn: ['TERMINEE', 'ANNULEE'] } 
      },
      include: { ACT_Responsable: true, ACT_PAQ: { include: { PAQ_Processus: true } } }
    });

    for (const action of overdue) {
      this.logger.warn(`RETARD : [${action.ACT_PAQ.PAQ_Processus.PR_Code}] ${action.ACT_Title} - Resp: ${action.ACT_Responsable.U_LastName}`);
    }

    // 2. Veille documentaire (Documents n'ayant pas bougé depuis 1 an)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const staleDocs = await this.prisma.document.findMany({
      where: { 
        DOC_UpdatedAt: { lte: oneYearAgo }, 
        DOC_IsArchived: false,
        DOC_Status: 'APPROUVE'
      }
    });

    for (const doc of staleDocs) {
      this.logger.warn(`DOC OBSOLÈTE : ${doc.DOC_Title} (Dernière révision: ${doc.DOC_UpdatedAt})`);
    }
  }
}