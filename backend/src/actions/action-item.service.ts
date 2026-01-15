import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Action } from '@prisma/client';

@Injectable()
export class ActionItemService {
  constructor(private prisma: PrismaService) {}

  async create(data: any): Promise<Action> {
    return await this.prisma.action.create({
      data: {
        ACT_Title: data.ACT_Title,
        ACT_Description: data.ACT_Description,
        ACT_Status: data.ACT_Status || 'A_FAIRE',
        ACT_ResponsableId: data.ACT_ResponsableId,
        ACT_CreatorId: data.ACT_CreatorId,
        ACT_PAQId: data.ACT_PAQId,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string): Promise<Action[]> {
    return this.prisma.action.findMany({
      where: { tenantId: tenantId },
      include: {
        ACT_Responsable: true,
        ACT_Creator: true,
      },
    });
  }

  async update(id: string, tenantId: string, data: any): Promise<Action> {
    const item = await this.prisma.action.findFirst({
      where: { ACT_Id: id, tenantId: tenantId },
    });
    if (!item) throw new Error("Action non trouvée pour ce tenant");

    return this.prisma.action.update({
      where: { ACT_Id: id },
      data: data,
    });
  }
}