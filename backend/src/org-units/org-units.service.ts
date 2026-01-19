import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';

@Injectable()
export class OrgUnitsService {
  private readonly model = 'orgUnit';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService,
  ) {}

  /**
   * ✅ CRÉATION D'UNE UNITÉ
   */
  async create(tenantId: string, data: any) {
    if (data.OU_ParentId) {
      const parent = await this.prisma.orgUnit.findFirst({
        where: { OU_Id: data.OU_ParentId, tenantId },
      });
      if (!parent) throw new BadRequestException("L'unité parente sélectionnée est invalide.");
    }

    const site = await this.prisma.site.findFirst({
      where: { S_Id: data.OU_SiteId, tenantId },
    });
    if (!site) throw new BadRequestException("Le site rattaché est invalide.");

    return this.genericCrud.create(this.model, tenantId, data);
  }

  /**
   * ✅ LECTURE : Vision 360° pour organigramme et fiches d'exposition
   */
  async findAll(tenantId: string) {
    return this.prisma.orgUnit.findMany({
      where: { tenantId },
      include: {
        OU_Type: true,
        OU_Site: true,
        OU_Parent: { select: { OU_Name: true } },
        OU_Users: {
          select: { U_Id: true, U_FirstName: true, U_LastName: true, U_Role: true }
        },
        _count: {
          select: { OU_Children: true, OU_Users: true }
        }
      },
      orderBy: { OU_Name: 'asc' },
    });
  }

  /**
   * ✅ MISE À JOUR
   */
  async update(id: string, tenantId: string, data: any) {
    return this.genericCrud.update(this.model, id, tenantId, data);
  }

  /**
   * ✅ SUPPRESSION SÉCURISÉE
   */
  async remove(id: string, tenantId: string) {
    const unit = await this.prisma.orgUnit.findFirst({
      where: { OU_Id: id, tenantId },
      include: { _count: { select: { OU_Children: true, OU_Users: true } } }
    });

    if (!unit) throw new NotFoundException("Unité introuvable.");

    if (unit._count.OU_Children > 0) {
      throw new BadRequestException("Cette unité contient des sous-unités.");
    }

    if (unit._count.OU_Users > 0) {
      throw new BadRequestException("Des collaborateurs sont encore rattachés à cette unité.");
    }

    return this.genericCrud.delete(this.model, id, tenantId);
  }
}