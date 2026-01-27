import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskStatus, ActionOrigin, ActionType, ActionStatus } from '@prisma/client';

@Injectable()
export class RisksService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, tenantId: string) {
    const p = parseInt(dto.RS_Probabilite) || 1;
    const g = parseInt(dto.RS_Gravite) || 1;
    const m = parseInt(dto.RS_Maitrise) || 1;
    const score = p * g * m;

    return await this.prisma.$transaction(async (tx) => {
      const risk = await tx.risk.create({
        data: {
          RS_Libelle: dto.RS_Libelle, RS_Probabilite: p, RS_Gravite: g, RS_Maitrise: m, RS_Score: score,
          RS_Status: score > 12 ? RiskStatus.SURVEILLE : RiskStatus.IDENTIFIE,
          tenant: { connect: { T_Id: tenantId } },
          RS_Processus: { connect: { PR_Id: dto.RS_ProcessusId } },
          RS_Type: { connect: { RT_Id: dto.RS_TypeId } },
        },
        include: { RS_Processus: true }
      });

      if (score > 12 && risk.RS_Processus) {
        const paq = await tx.pAQ.findFirst({ where: { PAQ_ProcessusId: dto.RS_ProcessusId, tenantId } });
        if (paq) {
          await tx.action.create({
            data: {
              ACT_Title: `Mitigation : ${risk.RS_Libelle}`, ACT_Origin: ActionOrigin.RISQUE,
              ACT_Type: ActionType.PREVENTIVE, ACT_Status: ActionStatus.A_FAIRE,
              ACT_PAQId: paq.PAQ_Id, tenantId, ACT_ResponsableId: risk.RS_Processus.PR_PiloteId,
              ACT_CreatorId: risk.RS_Processus.PR_PiloteId
            }
          });
        }
      }
      return risk;
    });
  }

  async update(id: string, tenantId: string, dto: any) {
    const p = parseInt(dto.RS_Probabilite) || 1;
    const g = parseInt(dto.RS_Gravite) || 1;
    const m = parseInt(dto.RS_Maitrise) || 1;

    return this.prisma.risk.update({
      where: { RS_Id: id, tenantId },
      data: {
        RS_Libelle: dto.RS_Libelle, RS_Probabilite: p, RS_Gravite: g, RS_Maitrise: m,
        RS_Score: p * g * m, RS_Status: (dto.RS_Status as RiskStatus),
        RS_Mesures: dto.RS_Mesures,
      }
    });
  }

  async getHeatmapData(tenantId: string, processusId?: string) {
    return this.prisma.risk.findMany({
      where: { tenantId, ...(processusId && { RS_ProcessusId: processusId }) },
      include: { RS_Processus: { select: { PR_Libelle: true, PR_Code: true } }, RS_Type: { select: { RT_Label: true } } },
      orderBy: { RS_Score: 'desc' },
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.risk.delete({ where: { RS_Id: id, tenantId } });
  }
}