import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';

@Injectable()
export class OrgUnitsService {
  private readonly logger = new Logger(OrgUnitsService.name);
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

    return this.genericCrud.create(this.model, tenantId, {
      ...data,
      OU_IsActive: true
    });
  }

  /**
   * ✅ LECTURE : Vision 360° (Organigramme & Fiches d'exposition)
   */
  async findAll(tenantId: string, includeArchived: boolean = false) {
    return this.prisma.orgUnit.findMany({
      where: { 
        tenantId,
        ...(includeArchived ? {} : { OU_IsActive: true })
      },
      include: {
        OU_Type: true,
        OU_Site: true,
        OU_Parent: { select: { OU_Name: true } },
        OU_Users: {
          where: { U_IsActive: true },
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
   * ✅ ARCHIVAGE SÉCURISÉ (Zéro suppression physique)
   */
  async remove(id: string, tenantId: string) {
    const unit = await this.prisma.orgUnit.findFirst({
      where: { OU_Id: id, tenantId },
      include: { 
        _count: { 
          select: { 
            OU_Children: true, // On vérifie les sous-unités
            OU_Users: true     // On vérifie les collaborateurs
          } 
        } 
      }
    });

    if (!unit) throw new NotFoundException("Unité introuvable.");

    // Règle métier : On ne peut pas archiver un parent si des enfants sont actifs
    if (unit._count.OU_Children > 0) {
      const activeChildren = await this.prisma.orgUnit.count({
        where: { OU_ParentId: id, OU_IsActive: true }
      });
      if (activeChildren > 0) {
        throw new BadRequestException(`Cette unité contient ${activeChildren} sous-unité(s) active(s).`);
      }
    }

    // Règle métier : On ne peut pas archiver si des collaborateurs sont actifs
    if (unit._count.OU_Users > 0) {
      const activeUsers = await this.prisma.user.count({
        where: { U_OrgUnitId: id, U_IsActive: true }
      });
      if (activeUsers > 0) {
        throw new BadRequestException(`Il reste ${activeUsers} collaborateur(s) actif(s) rattaché(s) à cette unité.`);
      }
    }

    this.logger.warn(`📁 Archivage de l'unité ${id} (Tenant: ${tenantId})`);

    return this.prisma.orgUnit.update({
      where: { OU_Id: id },
      data: { OU_IsActive: false }
    });
  }
}