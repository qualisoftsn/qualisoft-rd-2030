import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessusService {
  private readonly logger = new Logger(ProcessusService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LISTE : Vision globale avec Pilotes et Types
   */
  async findAll(tenantId: string) {
    return this.prisma.processus.findMany({
      where: { tenantId },
      include: {
        PR_Type: true,
        PR_Pilote: { select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true } },
      },
      orderBy: { PR_Code: 'asc' }
    });
  }

  /**
   * ✅ UNIQUE : Vue 360° exigée par l'ISO 9001
   */
  async findOne(id: string, tenantId: string) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { 
        PR_Type: true, 
        PR_Pilote: true,
        PR_CoPilote: true,
        PR_Indicators: { include: { IND_Values: true } }, // Performance
        PR_Risks: { where: { RS_Status: 'CRITIQUE' } }   // Risques majeurs
      }
    });
    if (!pr) throw new NotFoundException('Processus non trouvé');
    return pr;
  }

  /**
   * ✅ CRÉATION : Isolation stricte et contrôle d'unicité
   */
  async create(tenantId: string, dto: any) {
    try {
      return await this.prisma.processus.create({
        data: {
          PR_Code: dto.PR_Code.toUpperCase(),
          PR_Libelle: dto.PR_Libelle,
          PR_Description: dto.PR_Description || "",
          tenantId: tenantId,
          PR_TypeId: dto.PR_TypeId,
          PR_PiloteId: dto.PR_PiloteId,
          PR_CoPiloteId: dto.PR_CoPiloteId || null,
        }
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('Le code processus existe déjà');
      throw e;
    }
  }

  async update(id: string, tenantId: string, dto: any) {
    return this.prisma.processus.update({
      where: { PR_Id: id, tenantId },
      data: {
        PR_Code: dto.PR_Code?.toUpperCase(),
        PR_Libelle: dto.PR_Libelle,
        PR_TypeId: dto.PR_TypeId,
        PR_PiloteId: dto.PR_PiloteId,
        PR_CoPiloteId: dto.PR_CoPiloteId,
      }
    });
  }

  async remove(id: string, tenantId: string) {
    return this.prisma.processus.deleteMany({
      where: { PR_Id: id, tenantId }
    });
  }

  /**
   * ✅ ANALYTICS ÉLITE : Corrélation Performance / Risques / NC
   * Consolide la vision pour les revues de direction
   */
  async getAnalytics(id: string, tenantId: string) {
    const pr = await this.prisma.processus.findFirst({
      where: { PR_Id: id, tenantId },
      include: { 
        _count: { 
          select: { 
            PR_Risks: true, 
            PR_NonConformites: true,
            PR_Indicators: true,
            PR_PAQ: true
          } 
        } 
      }
    });
    
    // Calcul du taux d'efficacité (Exemple: Actions terminées dans le PAQ lié)
    const actionsStats = await this.prisma.action.groupBy({
      by: ['ACT_Status'],
      where: { ACT_PAQ: { PAQ_ProcessusId: id }, tenantId }
    });

    return { 
      stats: { 
        risks: pr?._count.PR_Risks || 0, 
        nc: pr?._count.PR_NonConformites || 0,
        indicators: pr?._count.PR_Indicators || 0,
        actions: actionsStats
      } 
    };
  }
}