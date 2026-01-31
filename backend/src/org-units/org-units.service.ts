import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenericCrudService } from '../common/generic-crud.service';

/**
 * 🛰️ SERVICE DE GESTION DES UNITÉS ORGANIQUES
 * Responsable de la cohérence de l'organigramme et du respect des règles ISO (§7.1.2).
 */
@Injectable()
export class OrgUnitsService {
  private readonly logger = new Logger(OrgUnitsService.name);
  private readonly model = 'orgUnit';

  constructor(
    private prisma: PrismaService,
    private genericCrud: GenericCrudService,
  ) {}

  /**
   * 🏗️ CRÉATION : Déploiement d'une nouvelle unité avec vérification des dépendances.
   */
  async create(tenantId: string, data: any) {
    this.logger.log(`[CREATE] Tentative de création d'unité : ${data.OU_Name} (Tenant: ${tenantId})`);

    // 1. Validation de l'unité parente si spécifiée
    if (data.OU_ParentId) {
      const parent = await this.prisma.orgUnit.findFirst({
        where: { OU_Id: data.OU_ParentId, tenantId },
      });
      if (!parent) {
        throw new BadRequestException("L'unité parente sélectionnée est introuvable ou invalide.");
      }
    }

    // 2. Validation de l'existence du site rattaché
    const site = await this.prisma.site.findFirst({
      where: { S_Id: data.OU_SiteId, tenantId },
    });
    if (!site) {
      throw new BadRequestException("Le site de rattachement spécifié est invalide.");
    }

    // 3. Délégation au CRUD générique pour l'insertion
    return this.genericCrud.create(this.model, tenantId, {
      ...data,
      OU_IsActive: true
    });
  }

  /**
   * 🔍 LECTURE : Vision 360° de la structure (Arborescence & Collaborateurs)
   * Cette méthode est cruciale pour le rendu de l'organigramme frontend.
   */
  async findAll(tenantId: string, includeArchived: boolean = false) {
    this.logger.debug(`[FIND-ALL] Récupération de la structure SMI (Tenant: ${tenantId})`);

    return this.prisma.orgUnit.findMany({
      where: { 
        tenantId,
        ...(includeArchived ? {} : { OU_IsActive: true })
      },
      include: {
        // Inclusion du type (Direction, Service, etc.) pour le badge frontend
        OU_Type: true,
        // Inclusion du site géographique
        OU_Site: true,
        // ✅ CRITIQUE : Sélection de l'OU_Id parent pour permettre le buildHierarchy() React
        OU_Parent: { 
          select: { 
            OU_Id: true, 
            OU_Name: true 
          } 
        },
        // Inclusion des collaborateurs actifs rattachés
        OU_Users: {
          where: { U_IsActive: true },
          select: { 
            U_Id: true, 
            U_FirstName: true, 
            U_LastName: true, 
            U_Role: true,
            U_Email: true
          }
        },
        // Statistiques de comptage pour l'interface
        _count: {
          select: { 
            OU_Children: true, 
            OU_Users: true 
          }
        }
      },
      orderBy: { OU_Name: 'asc' },
    });
  }

  /**
   * 🔄 MISE À JOUR : Mutation structurelle sécurisée.
   */
  async update(id: string, tenantId: string, data: any) {
    this.logger.log(`[UPDATE] Modification de l'unité ${id} (Tenant: ${tenantId})`);
    
    // Si on change le parent, on pourrait ajouter ici une vérification anti-boucle (A -> B -> A)
    if (data.OU_ParentId === id) {
      throw new BadRequestException("Une unité ne peut pas être son propre parent.");
    }

    return this.genericCrud.update(this.model, id, tenantId, data);
  }

  /**
   * 📁 ARCHIVAGE : Retrait de la chaine active avec contrôle d'intégrité (§7.5.3.2).
   */
  async remove(id: string, tenantId: string) {
    const unit = await this.prisma.orgUnit.findFirst({
      where: { OU_Id: id, tenantId },
      include: { 
        _count: { 
          select: { 
            OU_Children: true, 
            OU_Users: true 
          } 
        } 
      }
    });

    if (!unit) {
      throw new NotFoundException("Unité introuvable dans ce périmètre.");
    }

    // ⛔ RÈGLE MÉTIER 1 : Interdiction d'archiver si des sous-unités sont actives
    if (unit._count.OU_Children > 0) {
      const activeChildren = await this.prisma.orgUnit.count({
        where: { OU_ParentId: id, OU_IsActive: true }
      });
      if (activeChildren > 0) {
        throw new BadRequestException(`Impossible d'archiver : ${activeChildren} sous-unité(s) rattachée(s) est/sont encore active(s).`);
      }
    }

    // ⛔ RÈGLE MÉTIER 2 : Interdiction d'archiver si des collaborateurs y sont affectés
    if (unit._count.OU_Users > 0) {
      const activeUsers = await this.prisma.user.count({
        where: { U_OrgUnitId: id, U_IsActive: true }
      });
      if (activeUsers > 0) {
        throw new BadRequestException(`Impossible d'archiver : ${activeUsers} collaborateur(s) actif(s) est/sont encore rattaché(s).`);
      }
    }

    this.logger.warn(`[ARCHIVE] Désactivation de l'unité ${unit.OU_Name} (${id})`);

    // Utilisation du PrismaService pour le soft-delete (bascule du flag IsActive)
    return this.prisma.orgUnit.update({
      where: { OU_Id: id },
      data: { OU_IsActive: false }
    });
  }
}