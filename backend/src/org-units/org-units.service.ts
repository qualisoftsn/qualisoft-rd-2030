import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';
import { CreateOrgUnitDto } from './dto/create-org-unit.dto';
import { UpdateOrgUnitDto } from './dto/update-org-unit.dto';

@Injectable()
export class OrgUnitsService {
  private readonly logger = new Logger(OrgUnitsService.name);
  private readonly model = 'orgUnit';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService,
  ) {}

  async create(tenantId: string, dto: CreateOrgUnitDto) {
    this.logger.log(`[CREATE] Déploiement unité : ${dto.OU_Name} (Tenant: ${tenantId})`);

    // Validation Parent (Anti-Boucle & Existence)
    if (dto.OU_ParentId) {
      const parent = await this.prisma.orgUnit.findFirst({
        where: { OU_Id: dto.OU_ParentId, tenantId },
      });
      if (!parent) throw new BadRequestException("Unité parente introuvable.");
    }

    // Validation Site
    const site = await this.prisma.site.findFirst({
      where: { S_Id: dto.OU_SiteId, tenantId },
    });
    if (!site) throw new BadRequestException("Site de rattachement invalide.");

    return this.genericCrud.create(this.model, tenantId, {
      ...dto,
      OU_IsActive: true
    });
  }

  async findAll(tenantId: string, includeArchived: boolean = false) {
    return this.prisma.orgUnit.findMany({
      where: { 
        tenantId,
        ...(includeArchived ? {} : { OU_IsActive: true })
      },
      include: {
        OU_Type: true,
        OU_Site: true,
        OU_Parent: { select: { OU_Id: true, OU_Name: true } },
        OU_Users: {
          where: { U_IsActive: true },
          select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true }
        },
        _count: { select: { OU_Children: true, OU_Users: true } }
      },
      orderBy: { OU_Name: 'asc' },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateOrgUnitDto) {
    this.logger.log(`[UPDATE] Mutation unité ${id}`);

    if (dto.OU_ParentId === id) {
      throw new BadRequestException("Auto-parentage interdit.");
    }

    // Nettoyage pour Prisma (convertir les strings vides en null)
    const cleanedData = { ...dto };
    if (cleanedData.OU_ParentId === "") cleanedData.OU_ParentId = null;

    return this.genericCrud.update(this.model, id, tenantId, cleanedData);
  }

  async remove(id: string, tenantId: string) {
    const unit = await this.prisma.orgUnit.findFirst({
      where: { OU_Id: id, tenantId },
      include: { _count: { select: { OU_Children: true, OU_Users: true } } }
    });

    if (!unit) throw new NotFoundException("Unité introuvable.");

    // Contrôles d'intégrité ISO §7.5.3
    if (unit._count.OU_Children > 0) {
      throw new BadRequestException("Impossible d'archiver : Sous-unités encore rattachées.");
    }
    if (unit._count.OU_Users > 0) {
      throw new BadRequestException("Impossible d'archiver : Collaborateurs encore rattachés.");
    }

    return this.prisma.orgUnit.update({
      where: { OU_Id: id },
      data: { OU_IsActive: false }
    });
  }
}