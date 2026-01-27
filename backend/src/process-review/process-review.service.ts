import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NCStatus, ReviewStatus, ActionOrigin, ActionStatus } from '@prisma/client';

@Injectable()
export class ProcessReviewService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.processReview.findMany({
      where: { tenantId },
      include: { PRV_Processus: true },
      orderBy: [{ PRV_Year: 'desc' }, { PRV_Month: 'desc' }]
    });
  }

  async findOne(id: string) {
    const res = await this.prisma.processReview.findUnique({ where: { PRV_Id: id }, include: { PRV_Processus: true } });
    if (!res) throw new NotFoundException("Revue introuvable.");
    return res;
  }

  async initializeReview(processId: string, month: number, year: number, tenantId: string, docRef?: string) {
    const processus = await this.prisma.processus.findFirst({ where: { PR_Id: processId, tenantId } });
    if (!processus) throw new NotFoundException("Processus introuvable.");

    return this.prisma.processReview.upsert({
      where: { PRV_ProcessusId_PRV_Month_PRV_Year_tenantId: { PRV_ProcessusId: processId, PRV_Month: month, PRV_Year: year, tenantId } },
      update: { PRV_DocRef: docRef },
      create: {
        PRV_ProcessusId: processId, PRV_Month: month, PRV_Year: year, tenantId,
        PRV_DocRef: docRef || "F-QLT-011", PRV_Status: ReviewStatus.BROUILLON,
        PRV_PerformanceAnalysis: "Initialisation performance...",
        PRV_AuditAnalysis: "Scan audits...", PRV_RiskAnalysis: "Scan risques..."
      }
    });
  }

  async updateReview(id: string, dto: any, userRole: string) {
    const review = await this.prisma.processReview.findUnique({ where: { PRV_Id: id } });
    if (!review) throw new NotFoundException("Revue introuvable.");
    if (review.PRV_Status === ReviewStatus.VALIDEE && userRole !== 'ADMIN') throw new ForbiddenException("Document scellé.");

    return this.prisma.processReview.update({
      where: { PRV_Id: id },
      data: {
        PRV_PerformanceAnalysis: dto.performance, PRV_AuditAnalysis: dto.audit,
        PRV_RiskAnalysis: dto.risk, PRV_ResourcesAnalysis: dto.resources,
        PRV_Decisions: dto.decisions, PRV_Status: ReviewStatus.EN_COURS
      }
    });
  }

  async signReview(id: string, userId: string, role: string) {
    const updateData: any = {};
    if (role === 'PILOTE' || role === 'COPILOTE') updateData.PRV_PiloteSigned = true;
    else if (role === 'ADMIN' || role === 'RQ') updateData.PRV_RQSigned = true;

    const updated = await this.prisma.processReview.update({
      where: { PRV_Id: id }, data: updateData, include: { PRV_Processus: true }
    });

    if (updated.PRV_PiloteSigned && updated.PRV_RQSigned) {
      await this.prisma.processReview.update({ where: { PRV_Id: id }, data: { PRV_Status: ReviewStatus.VALIDEE } });
    }
    return updated;
  }

  async getReviewAnalytics(tenantId: string) {
    const reviews = await this.prisma.processReview.findMany({ where: { tenantId } });
    return { total: reviews.length, validated: reviews.filter(r => r.PRV_Status === ReviewStatus.VALIDEE).length };
  }
}