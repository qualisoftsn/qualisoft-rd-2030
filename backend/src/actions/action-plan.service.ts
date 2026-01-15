import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ActionPlanService {
  constructor(private prisma: PrismaService) {}

  async createFromNC(data: any, T_Id: string, creatorId: string) {
    return this.prisma.action.create({
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Description: data.ACT_Description,
        ACT_Status: 'A_FAIRE',
        tenantId: T_Id,
        ACT_NCId: data.ACT_NCId,
        ACT_ResponsableId: data.ACT_ResponsableId,
        ACT_CreatorId: creatorId,
        ACT_PAQId: data.ACT_PAQId,
        ACT_Deadline: data.ACT_Deadline ? new Date(data.ACT_Deadline) : null
      }
    });
  }

  async findAll(T_Id: string) {
    return this.prisma.action.findMany({
      where: { tenantId: T_Id, ACT_NCId: { not: null } },
      include: { ACT_NC: true, ACT_Responsable: true }
    });
  }
}