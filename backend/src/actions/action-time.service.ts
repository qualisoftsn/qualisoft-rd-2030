import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Action } from '@prisma/client';

@Injectable()
export class ActionTimeService {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<Action> {
    return await this.prisma.action.create({
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Deadline: data.ACT_Deadline ? new Date(data.ACT_Deadline) : null,
        ACT_ResponsableId: data.ACT_ResponsableId,
        ACT_CreatorId: data.ACT_CreatorId,
        ACT_PAQId: data.ACT_PAQId,
        tenantId: data.tenantId,
      },
    });
  }

  async findOverdue(tenantId: string): Promise<Action[]> {
    return this.prisma.action.findMany({
      where: {
        tenantId: tenantId,
        ACT_Deadline: { lt: new Date() },
        ACT_Status: { not: 'TERMINEE' },
      },
    });
  }

  async updateDeadline(id: string, tenantId: string, newDeadline: Date): Promise<Action> {
    const item = await this.prisma.action.findFirst({
      where: { ACT_Id: id, tenantId: tenantId },
    });
    if (!item) throw new Error("Action introuvable");

    return this.prisma.action.update({
      where: { ACT_Id: id },
      data: { ACT_Deadline: newDeadline },
    });
  }
}