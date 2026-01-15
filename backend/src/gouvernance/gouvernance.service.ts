import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GouvernanceService {
  constructor(private prisma: PrismaService) {}

  async getAvailableAuditors(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId: tenantId, U_IsActive: true },
      select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true },
      orderBy: { U_LastName: 'asc' }
    });
  }

  async getPlanning(tenantId: string, processId?: string, type?: any) {
    return this.prisma.governanceActivity.findMany({
      where: { 
        tenantId: tenantId,
        ...(type && { GA_Type: type })
      },
      include: { GA_Processes: true },
      orderBy: { GA_DatePlanned: 'asc' }
    });
  }

  async createActivity(tenantId: string, dto: any) {
    return this.prisma.governanceActivity.create({
      data: { ...dto, tenantId: tenantId }
    });
  }

  async updateActivity(id: string, tenantId: string, dto: any) {
    return this.prisma.governanceActivity.update({
      where: { GA_Id: id, tenantId: tenantId },
      data: dto
    });
  }
}