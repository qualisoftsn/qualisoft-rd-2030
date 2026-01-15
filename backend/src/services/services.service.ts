import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

 // Réécriture du bloc data dans src/services/services.service.ts
async create(tenantId: string, data: any) {
  return this.prisma.orgUnit.create({
    data: {
      OU_Name: data.OU_Name,
      tenant: { connect: { T_Id: tenantId } },
      OU_Site: { connect: { S_Id: data.OU_SiteId } },
      // ✅ On ajoute la liaison obligatoire vers le type CRUD
      OU_Type: { connect: { OUT_Id: data.OU_TypeId } }, 
    },
  });
}

  async findAll(T_Id: string) {
    return this.prisma.orgUnit.findMany({
      where: { tenantId: T_Id },
      include: { OU_Site: true }
    });
  }
}