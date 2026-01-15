import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessusSchedulerService {
  private readonly logger = new Logger(ProcessusSchedulerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('Vérification des échéances ISO/MASE...');
    const now = new Date();

    // 1. Actions en retard
    const overdueActions = await this.prisma.action.findMany({
      where: { ACT_Deadline: { lt: now }, ACT_Status: { not: 'TERMINEE' } },
      include: { ACT_Responsable: true }
    });

    overdueActions.forEach(action => {
      this.logger.warn(`Retard : ${action.ACT_Title} (Resp: ${action.ACT_Responsable.U_LastName})`);
    });

    // 2. Documents Obsolètes
    const limitDate = new Date();
    limitDate.setFullYear(limitDate.getFullYear() - 1);
    const obsoleteDocs = await this.prisma.document.findMany({
      where: { DOC_UpdatedAt: { lte: limitDate }, DOC_IsArchived: false }
    });

    obsoleteDocs.forEach(doc => {
      this.logger.warn(`Document à réviser : ${doc.DOC_Title}`);
    });
  }
}