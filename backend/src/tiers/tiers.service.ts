import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TiersService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ CRÉATION D'UN TIERS (MULTI-TENANT)
   */
  async create(dto: any, tenantId: string) {
    try {
      return await this.prisma.tier.create({
        data: {
          TR_Name: dto.TR_Name,
          TR_Email: dto.TR_Email || null,
          TR_Type: dto.TR_Type, // CLIENT, FOURNISSEUR, PARTENAIRE, ETAT
          tenant: { connect: { T_Id: tenantId } },
        },
      });
    } catch (error) {
      throw new BadRequestException("Erreur lors de la création du tiers. Vérifiez les données transmises.");
    }
  }

  /**
   * ✅ RÉCUPÉRATION DE TOUS LES TIERS AVEC FILTRAGE OPTIONNEL
   */
  async findAll(tenantId: string, type?: string) {
    return this.prisma.tier.findMany({
      where: { 
        tenantId: tenantId,
        ...(type && type !== 'ALL' ? { TR_Type: type as any } : {})
      },
      orderBy: { TR_Name: 'asc' },
      include: {
        _count: {
          select: { TR_Reclamations: true }
        }
      }
    });
  }

  /**
   * ✅ VUE 360° D'UN TIERS (RELATIONS AVEC RÉCLAMATIONS ET ACTIONS)
   */
  async findOne(id: string, tenantId: string) {
    const tier = await this.prisma.tier.findFirst({
      where: { 
        TR_Id: id, 
        tenantId: tenantId 
      },
      include: {
        TR_Reclamations: {
          take: 10,
          orderBy: { REC_CreatedAt: 'desc' },
          include: {
            REC_Processus: { select: { PR_Libelle: true } }
          }
        }
      }
    });

    if (!tier) {
      throw new NotFoundException(`Tiers avec l'ID ${id} introuvable dans votre organisation.`);
    }

    // Calcul des statistiques d'intelligence pour le panneau latéral
    const reclamationCount = await this.prisma.reclamation.count({
      where: { REC_TierId: id }
    });

    // On compte les actions liées aux réclamations de ce tiers
    const actionsCount = await this.prisma.action.count({
      where: { 
        ACT_Reclamation: { REC_TierId: id } 
      }
    });

    return {
      ...tier,
      stats: {
        reclamations: reclamationCount,
        actions: actionsCount
      }
    };
  }

  /**
   * ✅ MISE À JOUR SÉCURISÉE
   */
  async update(id: string, tenantId: string, dto: any) {
    const existing = await this.prisma.tier.findFirst({
      where: { TR_Id: id, tenantId: tenantId }
    });

    if (!existing) {
      throw new NotFoundException("Tiers introuvable ou accès non autorisé.");
    }

    return this.prisma.tier.update({
      where: { TR_Id: id },
      data: {
        TR_Name: dto.TR_Name,
        TR_Email: dto.TR_Email,
        TR_Type: dto.TR_Type,
      },
    });
  }

  /**
   * ✅ SUPPRESSION (Vérifie l'appartenance au Tenant)
   */
  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.tier.findFirst({
      where: { TR_Id: id, tenantId: tenantId }
    });

    if (!existing) {
      throw new NotFoundException("Tiers introuvable.");
    }

    // Note : Prisma gérera la restriction si des réclamations y sont liées (intégrité referentielle)
    return this.prisma.tier.delete({
      where: { TR_Id: id }
    });
  }
}