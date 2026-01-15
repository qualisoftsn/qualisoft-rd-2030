import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessTypeService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    let types = await this.prisma.processType.findMany({
      where: { tenantId: tenantId },
      orderBy: { PT_Label: 'asc' }
    });

    // Auto-alimentation si vide (Sécurité pour listes vides)
    if (types.length === 0) {
      await this.prisma.processType.createMany({
        data: [
          { PT_Label: 'MANAGEMENT', tenantId: tenantId },
          { PT_Label: 'OPÉRATIONNEL', tenantId: tenantId },
          { PT_Label: 'SUPPORT', tenantId: tenantId }
        ]
      });
      return this.prisma.processType.findMany({ where: { tenantId: tenantId } });
    }
    return types;
  }
}