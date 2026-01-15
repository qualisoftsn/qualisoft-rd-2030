import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async updateSettings(tenantId: string, updateData: any) {
    // 🛡️ SÉCURITÉ : On ne permet de changer que l'Email de contact admin
    // Le nom (T_Name) et le Plan (T_Plan) sont verrouillés.
    const { T_Email } = updateData;

    const tenant = await this.prisma.tenant.findUnique({ where: { T_Id: tenantId } });
    if (!tenant) throw new NotFoundException("Organisation introuvable.");

    return this.prisma.tenant.update({
      where: { T_Id: tenantId },
      data: {
        T_Email: T_Email, // Champ existant dans ton schéma
      },
    });
  }
}