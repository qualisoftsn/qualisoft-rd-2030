import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  Logger, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';

@Injectable()
export class SitesService {
  private readonly logger = new Logger(SitesService.name);
  private readonly model = 'site';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService
  ) {}

  /**
   * ✅ CRÉATION D'UN SITE
   * Utilise le champ normalisé 'tenantId'
   */
  async create(tenantId: string, data: { S_Name: string; S_Address?: string }) {
    this.logger.log(`[CREATE] Création de site pour le Tenant: ${tenantId}`);

    if (!data.S_Name || data.S_Name.trim() === '') {
      throw new BadRequestException("Le nom du site (S_Name) est obligatoire.");
    }

    try {
      // On utilise le genericCrud pour bénéficier de l'isolation automatique
      return await this.genericCrud.create(this.model, tenantId, {
        S_Name: data.S_Name.trim(),
        S_Address: data.S_Address?.trim() || null,
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException("Une implantation portant ce nom existe déjà dans votre organisation.");
      }
      throw new BadRequestException("Erreur technique lors de la création du site.");
    }
  }

  /**
   * ✅ RÉCUPÉRATION DU RÉFÉRENTIEL SITES
   * Avec comptage des unités pour le Dashboard
   */
  async findAll(tenantId: string) {
    return this.prisma.site.findMany({
      where: { tenantId }, // 🔄 Correction : tenantId au lieu de tenantId
      include: {
        _count: {
          select: { S_OrgUnits: true } 
        }
      },
      orderBy: { S_Name: 'asc' },
    });
  }

  /**
   * ✅ DÉTAILS D'UN SITE
   */
  async findOne(id: string, tenantId: string) {
    const site = await this.prisma.site.findFirst({
      where: {
        S_Id: id,
        tenantId, // 🔄 Correction : tenantId
      },
      include: { 
        S_OrgUnits: true
      },
    });

    if (!site) {
      throw new NotFoundException(`L'implantation demandée est introuvable.`);
    }
    
    return site;
  }

  /**
   * ✅ MISE À JOUR
   */
  async update(id: string, tenantId: string, data: { S_Name?: string; S_Address?: string }) {
    // Le genericCrud s'occupe de vérifier la propriété (tenantId)
    try {
      return await this.genericCrud.update(this.model, id, tenantId, {
        ...(data.S_Name && { S_Name: data.S_Name.trim() }),
        ...(data.S_Address !== undefined && { S_Address: data.S_Address?.trim() || null }),
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException("Ce nom de site est déjà utilisé.");
      }
      throw error;
    }
  }

  /**
   * ✅ SUPPRESSION SÉCURISÉE
   */
  async remove(id: string, tenantId: string) {
    // 1. Vérification de l'intégrité (Règle métier SMI)
    const linkedUnits = await this.prisma.orgUnit.count({
      where: { OU_SiteId: id, tenantId }
    });

    if (linkedUnits > 0) {
      throw new BadRequestException(
        `Suppression impossible : ${linkedUnits} unité(s) organique(s) sont rattachée(s) à ce site. Veuillez les déplacer ou les supprimer d'abord.`
      );
    }

    // 2. Appel au service générique pour la suppression physique
    return this.genericCrud.delete(this.model, id, tenantId);
  }
}