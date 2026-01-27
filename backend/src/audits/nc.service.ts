import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NCStatus, NCGravity, NCSource } from '@prisma/client';

@Injectable()
export class NcService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LISTE : Récupération de toutes les NC d'un tenant
   */
  async findAll(tenantId: string) {
    return this.prisma.nonConformite.findMany({
      where: { tenantId },
      include: { 
        NC_Processus: { select: { PR_Libelle: true, PR_Code: true } }, 
        NC_Detector: { select: { U_FirstName: true, U_LastName: true } }, 
        NC_Actions: true 
      },
      orderBy: { NC_CreatedAt: 'desc' }
    });
  }

  /**
   * ✅ UNIQUE : Détails d'une NC (Appelé par nc.controller.ts:47)
   */
  async findOne(id: string, tenantId: string) {
    const nc = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId },
      include: {
        NC_Processus: true,
        NC_Detector: true,
        NC_Actions: {
          include: { ACT_Responsable: true }
        },
        NC_Audit: true,
        NC_Preuves: true
      }
    });

    if (!nc) {
      throw new NotFoundException(`La Non-Conformité avec l'ID ${id} est introuvable.`);
    }

    return nc;
  }

  /**
   * ✅ CRÉATION : Enregistrement d'une nouvelle NC
   */
  async create(dto: any, tenantId: string, detectorId: string) {
    return this.prisma.nonConformite.create({
      data: {
        NC_Libelle: dto.NC_Libelle,
        NC_Description: dto.NC_Description,
        NC_Gravite: (dto.NC_Gravite as NCGravity) || NCGravity.MINEURE,
        NC_Statut: NCStatus.DETECTION,
        NC_Source: (dto.NC_Source as NCSource) || NCSource.PROCESS_REVIEW,
        tenantId: tenantId,
        NC_DetectorId: detectorId,
        NC_ProcessusId: dto.NC_ProcessusId,
      }
    });
  }

  /**
   * ✅ MISE À JOUR : Cycle de vie de la NC
   */
  async update(id: string, dto: any, tenantId: string) {
    return this.prisma.nonConformite.update({
      where: { NC_Id: id, tenantId },
      data: {
        NC_Libelle: dto.NC_Libelle,
        NC_Description: dto.NC_Description,
        NC_Statut: (dto.NC_Statut as NCStatus),
        NC_Gravite: (dto.NC_Gravite as NCGravity),
        NC_Diagnostic: dto.NC_Diagnostic
      }
    });
  }

  /**
   * ✅ SUPPRESSION : Retrait du noyau
   */
  async remove(id: string, tenantId: string) {
    return this.prisma.nonConformite.delete({
      where: { NC_Id: id, tenantId }
    });
  }
}