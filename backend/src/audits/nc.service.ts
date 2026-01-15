import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NcService {
  constructor(private prisma: PrismaService) {}

  /**
   * Création d'une Non-Conformité
   */
  async create(data: any, T_Id: string, detectorId: string) {
    return this.prisma.nonConformite.create({
      data: {
        NC_Libelle: data.NC_Libelle,
        NC_Description: data.NC_Description,
        NC_Gravite: data.NC_Gravite || 'MINEURE',
        NC_Statut: 'A_TRAITER',
        NC_Source: data.NC_Source || 'INTERNAL_AUDIT',
        tenantId: T_Id,
        NC_DetectorId: detectorId,
        NC_AuditId: data.NC_AuditId || null,
      },
    });
  }

  /**
   * Liste des NC avec filtres par Tenant
   */
  async findAll(T_Id: string) {
    return this.prisma.nonConformite.findMany({
      where: { tenantId: T_Id },
      include: {
        NC_Detector: {
          select: { U_FirstName: true, U_LastName: true },
        },
        NC_Actions: true, // Relation NC_Actions définie dans ton schéma
      },
      orderBy: { NC_CreatedAt: 'desc' },
    });
  }

  /**
   * Mise à jour du statut d'une NC
   */
  async updateStatus(id: string, statut: string, T_Id: string) {
    const nc = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId: T_Id },
    });

    if (!nc) throw new NotFoundException('Non-conformité introuvable pour ce tenant.');

    return this.prisma.nonConformite.update({
      where: { NC_Id: id },
      data: { NC_Statut: statut },
    });
  }

  /**
   * Récupère une NC avec tout son historique d'actions
   */
  async findOne(id: string, T_Id: string) {
    return this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId: T_Id },
      include: {
        NC_Actions: {
          include: {
            ACT_Responsable: { select: { U_FirstName: true, U_LastName: true } },
          },
        },
        NC_Audit: true,
      },
    });
  }
}