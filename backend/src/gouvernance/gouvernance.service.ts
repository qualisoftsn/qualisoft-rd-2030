import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GovernanceType } from '@prisma/client';

@Injectable()
export class GouvernanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ RÉFÉRENTIEL : Liste des auditeurs qualifiés disponibles
   */
  async getAvailableAuditors(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true },
      orderBy: { U_LastName: 'asc' }
    });
  }

  /**
   * ✅ PLANNING : Récupération des activités (Audits, COPIL, Revues)
   */
  async getPlanning(tenantId: string, processId?: string, type?: GovernanceType) {
    return this.prisma.governanceActivity.findMany({
      where: { 
        tenantId,
        ...(type && { GA_Type: type }),
        ...(processId && { GA_Processes: { some: { PR_Id: processId } } })
      },
      include: { GA_Processes: true },
      orderBy: { GA_DatePlanned: 'asc' }
    });
  }

  /**
   * ✅ GESTION : Création d'une activité de gouvernance
   */
  async createActivity(tenantId: string, dto: any) {
    return this.prisma.governanceActivity.create({
      data: { ...dto, tenantId }
    });
  }

  /**
   * ✅ GESTION : Mise à jour d'une activité existante
   */
  async updateActivity(id: string, tenantId: string, dto: any) {
    return this.prisma.governanceActivity.update({
      where: { GA_Id: id, tenantId },
      data: dto
    });
  }
}