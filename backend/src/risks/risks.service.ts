import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RisksService {
  private readonly logger = new Logger(RisksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉATION CONFORME EXCEL (PxGxM)
   */
  async create(dto: any, tenantId: string) {
    const p = parseInt(dto.RS_Probabilite) || 1;
    const g = parseInt(dto.RS_Gravite) || 1;
    const m = parseInt(dto.RS_Maitrise) || 1;

    try {
      return await this.prisma.risk.create({
        data: {
          RS_Libelle: dto.RS_Libelle,
          RS_Activite: dto.RS_Activite || "",
          RS_Tache: dto.RS_Tache || "",
          RS_Causes: dto.RS_Causes || "",
          RS_Description: dto.RS_Description || "",
          RS_Probabilite: p,
          RS_Gravite: g,
          RS_Maitrise: m,
          RS_Score: p * g * m, // ✅ Calcul PxGxM
          RS_Status: dto.RS_Status || "IDENTIFIE",
          RS_Mesures: dto.RS_Mesures || "",
          RS_Acteurs: dto.RS_Acteurs || "",
          RS_NextReview: dto.RS_NextReview ? new Date(dto.RS_NextReview) : null,
          
          tenant: { connect: { T_Id: tenantId } },
          RS_Processus: { connect: { PR_Id: dto.RS_ProcessusId } },
          RS_Type: { connect: { RT_Id: dto.RS_TypeId } },
        },
        include: {
          RS_Processus: true,
          RS_Type: true
        }
      });
    } catch (error: any) {
      this.logger.error(`Erreur création: ${error?.message}`);
      throw new BadRequestException("Échec de création du risque.");
    }
  }

  /**
   * ✅ RÉCUPÉRATION HEATMAP (PxGxM)
   */
  async getHeatmapData(tenantId: string, processusId?: string) {
    return this.prisma.risk.findMany({
      where: { 
        tenantId: tenantId, 
        ...(processusId && { RS_ProcessusId: processusId }) 
      },
      include: { 
        RS_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        RS_Type: { select: { RT_Label: true } }
      },
      orderBy: { RS_Score: 'desc' },
    });
  }

  /**
   * ✅ MISE À JOUR SÉCURISÉE
   */
  async update(id: string, tenantId: string, dto: any) {
    const p = parseInt(dto.RS_Probabilite) || 1;
    const g = parseInt(dto.RS_Gravite) || 1;
    const m = parseInt(dto.RS_Maitrise) || 1;

    return this.prisma.risk.update({
      where: { RS_Id: id, tenantId: tenantId },
      data: {
        RS_Libelle: dto.RS_Libelle,
        RS_Activite: dto.RS_Activite,
        RS_Tache: dto.RS_Tache,
        RS_Causes: dto.RS_Causes,
        RS_Probabilite: p,
        RS_Gravite: g,
        RS_Maitrise: m,
        RS_Score: p * g * m,
        RS_Status: dto.RS_Status,
        RS_Mesures: dto.RS_Mesures,
        RS_Acteurs: dto.RS_Acteurs,
        RS_NextReview: dto.RS_NextReview ? new Date(dto.RS_NextReview) : null,
        ...(dto.RS_TypeId && { RS_Type: { connect: { RT_Id: dto.RS_TypeId } } }),
      }
    });
  }

  /**
   * ✅ SUPPRESSION
   */
  async remove(id: string, tenantId: string) {
    return this.prisma.risk.delete({ 
      where: { RS_Id: id, tenantId: tenantId } 
    });
  }
}