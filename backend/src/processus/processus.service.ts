import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskStatus } from '@prisma/client';

@Injectable()
export class ProcessusService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.processus.findMany({
      where: { tenantId },
      include: { PR_Type: true, PR_Pilote: { select: { U_Id: true, U_FirstName: true, U_LastName: true } } },
      orderBy: { PR_Code: 'asc' }
    });
  }

  async findOne(id: string, tenantId: string) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { 
        PR_Type: true, PR_Pilote: true,
        PR_Indicators: { include: { IND_Values: true } },
        PR_Risks: { where: { RS_Status: RiskStatus.SURVEILLE } }
      }
    });
    if (!pr) throw new NotFoundException('Processus non trouvé');
    return pr;
  }

  async create(tenantId: string, dto: any) {
    try {
      return await this.prisma.processus.create({
        data: { ...dto, PR_Code: dto.PR_Code.toUpperCase(), tenantId }
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Le code processus existe déjà');
      throw e;
    }
  }

  async update(id: string, tenantId: string, dto: any) {
    return this.prisma.processus.update({
      where: { PR_Id: id, tenantId },
      data: { PR_Code: dto.PR_Code?.toUpperCase(), PR_Libelle: dto.PR_Libelle, PR_TypeId: dto.PR_TypeId, PR_PiloteId: dto.PR_PiloteId }
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.processus.deleteMany({ where: { PR_Id: id, tenantId } });
  }

  async getAnalytics(id: string, tenantId: string) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { _count: { select: { PR_Risks: true, PR_NonConformites: true, PR_Indicators: true, PR_PAQ: true } } }
    });
    return { stats: pr?._count };
  }
}