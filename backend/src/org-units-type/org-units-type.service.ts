import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgUnitsTypeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.orgUnitType.findMany({ orderBy: { OUT_Label: 'asc' } });
  }

  async create(data: any) {
    return this.prisma.orgUnitType.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.orgUnitType.update({ where: { OUT_Id: id }, data });
  }

  async remove(id: string) {
    return this.prisma.orgUnitType.delete({ where: { OUT_Id: id } });
  }
}