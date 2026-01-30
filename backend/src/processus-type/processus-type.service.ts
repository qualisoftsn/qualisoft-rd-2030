import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProcessusTypeService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.processType.findMany({ orderBy: { PT_Label: 'asc' } });
  }

  async create(data: any) {
    return this.prisma.processType.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.processType.update({ where: { PT_Id: id }, data });
  }

  async remove(id: string) {
    return this.prisma.processType.delete({ where: { PT_Id: id } });
  }
}