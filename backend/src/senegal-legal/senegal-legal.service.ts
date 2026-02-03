import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto } from './dto/create-legal-requirement.dto';
import { UpdateRequirementDto } from './dto/update-requirement.dto';

@Injectable()
export class SenegalLegalService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    const requirements = await this.prisma.senegalLegalRequirement.findMany({
      where: { tenantId, SLR_IsActive: true },
      orderBy: { SLR_CreatedAt: 'desc' }
    });
    return { requirements };
  }

  async getStats(tenantId: string) {
    const all = await this.prisma.senegalLegalRequirement.findMany({ 
      where: { tenantId, SLR_IsActive: true } 
    });
    
    const total = all.length;
    const compliant = all.filter(r => r.SLR_Status === 'RESPECTEE').length;
    const nonCompliant = all.filter(r => r.SLR_Status === 'NON_CONFORME').length;
    
    return {
      total,
      compliant,
      nonCompliant,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0
    };
  }

  async create(tenantId: string, dto: CreateRequirementDto) {
    return this.prisma.senegalLegalRequirement.create({
      data: {
        ...dto,
        tenantId,
        SLR_Deadline: dto.SLR_Deadline ? new Date(dto.SLR_Deadline) : null,
        SLR_Status: 'A_RESPECTER'
      }
    });
  }

  async update(tenantId: string, id: string, dto: UpdateRequirementDto) {
    const exists = await this.prisma.senegalLegalRequirement.findFirst({
      where: { SLR_Id: id, tenantId }
    });

    if (!exists) throw new NotFoundException("EXIGENCE LÉGALE INTROUVABLE");

    const data: any = { ...dto };
    if (dto.SLR_Deadline) data.SLR_Deadline = new Date(dto.SLR_Deadline);

    return this.prisma.senegalLegalRequirement.update({
      where: { SLR_Id: id },
      data
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    return this.prisma.senegalLegalRequirement.update({
      where: { SLR_Id: id, tenantId },
      data: { SLR_Status: status }
    });
  }
}