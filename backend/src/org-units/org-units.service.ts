import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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
   * Vérifie l'appartenance du Parent et du Site
   */
  async create(tenantId: string, data: any) {
    // 1. Si un parent est défini, on vérifie qu'il appartient au même Tenant
    if (data.OU_ParentId) {
      const parent = await this.prisma.orgUnit.findFirst({
        where: { OU_Id: data.OU_ParentId, tenantId },
      });
      if (!parent) {
        throw new BadRequestException("L'unité parente sélectionnée est invalide.");
      }
    }

    // 2. On vérifie que le Site appartient au même Tenant
    const site = await this.prisma.site.findFirst({
      where: { S_Id: data.OU_SiteId, tenantId },
    });
    if (!site) {
      throw new BadRequestException("Le site rattaché est invalide.");
    }

    return this.genericCrud.create(this.model, tenantId, data);
  }

  /**
   * ✅ LECTURE DE L'ORGANIGRAMME
   * Inclut les relations pour le Frontend (Next.js)
   */
  async findAll(tenantId: string) {
    return this.prisma.orgUnit.findMany({
      where: { tenantId },
      include: {
        OU_Type: true,   // Ex: DIRECTION
        OU_Site: true,   // Ex: Siège Dakar
        OU_Parent: {     // Pour connaître le parent direct
            select: { OU_Name: true }
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
    // Le GenericCrud vérifie déjà si l'unité appartient au tenantId
    return this.genericCrud.update(this.model, id, tenantId, data);
  }

  /**
   * ✅ SUPPRESSION SÉCURISÉE (Pas d'orphelins)
   */
  async remove(id: string, tenantId: string) {
    // On ne supprime pas si l'unité a des sous-unités (enfants)
    const hasChildren = await this.prisma.orgUnit.count({
      where: { OU_ParentId: id },
    });

    if (hasChildren > 0) {
      throw new BadRequestException(
        "Cette unité contient des sous-unités. Veuillez les déplacer ou les supprimer avant."
      );
    }

    return this.genericCrud.delete(this.model, id, tenantId);
  }
}