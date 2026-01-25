import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(private prisma: PrismaService) {}

  // 🏗️ CRÉATION
  async create(dto: CreateTenantDto) {
    this.logger.log(`🏗️ Nouveau Tenant : ${dto.T_Name}`);
    return this.prisma.tenant.create({
      data: { ...dto, T_IsActive: true }
    });
  }

  // 📋 RÉCUPÉRATION (Uniquement les actifs par défaut)
  async findAll(includeArchived: boolean = false) {
    return this.prisma.tenant.findMany({
      where: includeArchived ? {} : { T_IsActive: true },
      include: {
        _count: { select: { T_Users: true, T_Sites: true } }
      }
    });
  }

  // 📝 MISE À JOUR
  async update(id: string, dto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: dto
    });
  }

  // 📁 ARCHIVAGE (Zéro suppression)
  async archive(id: string) {
    this.logger.warn(`📁 Archivage du Tenant ID: ${id}`);
    return this.prisma.tenant.update({
      where: { T_Id: id },
      data: { T_IsActive: false }
    });
  }
}