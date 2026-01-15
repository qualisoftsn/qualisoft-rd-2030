import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PartiesInteresseesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, T_Id: string) {
    return this.prisma.tier.create({
      data: {
        TR_Name: data.nom,
        TR_Type: data.type,
        tenantId: T_Id
      }
    });
  }

  // Correction : signature acceptant 2 arguments pour le filtrage
  async findAll(T_Id: string, type?: any) {
    return this.prisma.tier.findMany({
      where: { 
        tenantId: T_Id,
        TR_Type: type || undefined
      }
    });
  }
}