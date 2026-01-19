import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PreuvesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    return this.prisma.preuve.create({ data });
  }

  async findByAudit(auditId: string) {
    return this.prisma.preuve.findMany({ where: { PV_AuditId: auditId } });
  }
}