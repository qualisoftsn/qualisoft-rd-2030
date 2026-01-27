import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GovernanceType, GovernanceActivity, User } from '@prisma/client';

// Interface stricte pour la création/mise à jour
interface GovernanceActivityDto {
  GA_Title: string;
  GA_Type: GovernanceType;
  GA_DatePlanned: string | Date;
  GA_Deadline?: string | Date;
  GA_Status: 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'POSTPONED' | 'CANCELLED';
  GA_Theme?: string;
  GA_Observations?: string;
  GA_Location?: string;
  processIds?: string[]; 
}

@Injectable()
export class GouvernanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ PERFORMANCE : Calcul des KPIs (Anti-crash 500)
   */
  async getPerformance(tenantId: string) {
    const activities = await this.prisma.governanceActivity.findMany({
      where: { tenantId }
    });

    const total = activities.length;
    
    // Protection contre la division par zéro (Si instance vide)
    if (total === 0) {
      return { stats: { completionRate: 0, punctualityRate: 0, late: 0, total: 0 } };
    }

    const done = activities.filter(a => a.GA_Status === 'DONE').length;
    const late = activities.filter(a => 
      a.GA_Status !== 'DONE' && 
      a.GA_Deadline && 
      new Date(a.GA_Deadline) < new Date()
    ).length;

    return {
      stats: {
        total,
        late,
        completionRate: Math.round((done / total) * 100),
        punctualityRate: Math.round(((total - late) / total) * 100)
      }
    };
  }

  /**
   * ✅ RÉFÉRENTIEL : Liste des auditeurs
   */
  async getAvailableAuditors(tenantId: string): Promise<Partial<User>[]> {
    return this.prisma.user.findMany({
      where: { tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true },
      orderBy: { U_LastName: 'asc' }
    });
  }

  /**
   * ✅ PLANNING : Récupération filtrée
   */
  async getPlanning(tenantId: string, type?: GovernanceType, processId?: string): Promise<GovernanceActivity[]> {
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
   * ✅ GESTION : Création avec liaisons processus
   */
  async createActivity(tenantId: string, dto: GovernanceActivityDto): Promise<GovernanceActivity> {
    const { processIds, ...data } = dto;
    
    return this.prisma.governanceActivity.create({
      data: {
        ...data,
        tenantId,
        GA_DatePlanned: new Date(data.GA_DatePlanned),
        GA_Deadline: data.GA_Deadline ? new Date(data.GA_Deadline) : null,
        ...(processIds && {
          GA_Processes: {
            connect: processIds.map(id => ({ PR_Id: id }))
          }
        })
      },
      include: { GA_Processes: true }
    });
  }

  /**
   * ✅ GESTION : Mise à jour sécurisée
   */
  async updateActivity(id: string, tenantId: string, dto: Partial<GovernanceActivityDto>): Promise<GovernanceActivity> {
    const activity = await this.prisma.governanceActivity.findFirst({
      where: { GA_Id: id, tenantId }
    });

    if (!activity) throw new NotFoundException("Activité introuvable.");

    const { processIds, ...data } = dto;

    return this.prisma.governanceActivity.update({
      where: { GA_Id: id },
      data: {
        ...data,
        ...(data.GA_DatePlanned && { GA_DatePlanned: new Date(data.GA_DatePlanned) }),
        ...(data.GA_Deadline && { GA_Deadline: new Date(data.GA_Deadline) }),
        ...(processIds && {
          GA_Processes: {
            set: processIds.map(id => ({ PR_Id: id }))
          }
        })
      },
      include: { GA_Processes: true }
    });
  }

  /**
   * ✅ GESTION : Suppression
   */
  async deleteActivity(id: string, tenantId: string): Promise<void> {
    const activity = await this.prisma.governanceActivity.findFirst({
      where: { GA_Id: id, tenantId }
    });

    if (!activity) throw new NotFoundException("Activité introuvable.");
    
    await this.prisma.governanceActivity.delete({ where: { GA_Id: id } });
  }
}