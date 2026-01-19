import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessTypeService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ AUTO-MAINTENANCE : Garantit la présence des types ISO standards
   */
  async findAll(tenantId: string) {
    let types = await this.prisma.processType.findMany({
      where: { tenantId },
      orderBy: { PT_Label: 'asc' }
    });

    if (types.length === 0) {
      await this.prisma.processType.createMany({
        data: [
          { PT_Label: 'MANAGEMENT', PT_Color: '#1e40af', tenantId },
          { PT_Label: 'OPÉRATIONNEL', PT_Color: '#15803d', tenantId },
          { PT_Label: 'SUPPORT', PT_Color: '#b45309', tenantId }
        ]
      });
      return this.prisma.processType.findMany({ where: { tenantId } });
    }
    return types;
  }
}