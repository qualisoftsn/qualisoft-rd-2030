import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Logger, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';

export interface SiteInput {
  S_Name: string;
  S_Address?: string;
  S_IsActive?: boolean;
}

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);
  private readonly model = 'site';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService
  ) {}

  async create(tenantId: string, data: SiteInput) {
    if (!data.S_Name || data.S_Name.trim() === '') {
      throw new BadRequestException("Le nom du site est obligatoire.");
    }

    try {
      return await this.genericCrud.create(this.model, tenantId, {
        S_Name: data.S_Name.trim(),
        S_Address: data.S_Address?.trim() || null,
        S_IsActive: true,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException("Une implantation avec ce nom existe déjà.");
      }
      throw new BadRequestException("Erreur technique lors de la création du site.");
    }
  }

  async findAll(tenantId: string, includeArchived = false) {
    return this.prisma.site.findMany({
      where: { 
        tenantId,
        ...(includeArchived ? {} : { S_IsActive: true }) 
      },
      include: {
        _count: { select: { S_OrgUnits: true } }
      },
      orderBy: { S_Name: 'asc' },
    });
  }

  async findOne(id: string, tenantId: string) {
    const site = await this.prisma.site.findFirst({
      where: { S_Id: id, tenantId },
      include: { 
        S_OrgUnits: { where: { OU_IsActive: true } }
      },
    });

    if (!site) throw new NotFoundException(`Implantation introuvable.`);
    return site;
  }

  async update(id: string, tenantId: string, data: SiteInput) {
    return this.genericCrud.update(this.model, id, tenantId, {
      ...(data.S_Name && { S_Name: data.S_Name.trim() }),
      ...(data.S_Address !== undefined && { S_Address: data.S_Address?.trim() || null }),
      ...(data.S_IsActive !== undefined && { S_IsActive: data.S_IsActive }),
    });
  }

  async remove(id: string, tenantId: string) {
    const linkedUnits = await this.prisma.orgUnit.count({
      where: { OU_SiteId: id, tenantId, OU_IsActive: true }
    });

    if (linkedUnits > 0) {
      throw new BadRequestException(`Impossible d'archiver : ${linkedUnits} unité(s) active(s) détectée(s).`);
    }

    return this.prisma.site.update({
      where: { S_Id: id, tenantId },
      data: { S_IsActive: false }
    });
  }
}