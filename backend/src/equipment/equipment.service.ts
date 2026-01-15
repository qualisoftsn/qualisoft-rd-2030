import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EquipmentService {
  constructor(private prisma: PrismaService) {}

  async findAll(T_Id: string) {
    return this.prisma.equipment.findMany({
      where: { tenantId: T_Id },
      orderBy: { EQ_ProchaineVGP: 'asc' },
    });
  }

  async create(data: any, T_Id: string) {
    return this.prisma.equipment.create({
      data: {
        EQ_Reference: data.EQ_Reference,
        EQ_Name: data.EQ_Name,
        EQ_DateService: new Date(data.EQ_DateService),
        EQ_ProchaineVGP: new Date(data.EQ_ProchaineVGP),
        EQ_Status: data.EQ_Status || "OPERATIONNEL",
        tenantId: T_Id,
      }
    });
  }

  async update(id: string, data: any, T_Id: string) {
    // Utilisation de update car l'ID est unique et vérifié par TenantId
    return this.prisma.equipment.updateMany({
      where: { EQ_Id: id, tenantId: T_Id },
      data: {
        ...data,
        EQ_DateService: data.EQ_DateService ? new Date(data.EQ_DateService) : undefined,
        EQ_ProchaineVGP: data.EQ_ProchaineVGP ? new Date(data.EQ_ProchaineVGP) : undefined,
      }
    });
  }

  async remove(id: string, T_Id: string) {
    return this.prisma.equipment.deleteMany({
      where: { EQ_Id: id, tenantId: T_Id }
    });
  }
}