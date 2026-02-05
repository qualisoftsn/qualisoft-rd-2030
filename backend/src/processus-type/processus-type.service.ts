import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * 🛠️ SERVICE : ProcessusType
 * Gère les catégories de processus (Pilotage, Opérationnel, Support) par Tenant.
 * Référentiel ISO 9001 §4.4
 */
@Injectable()
export class ProcessusTypeService {
  constructor(private prisma: PrismaService) {}

  /**
   * 🔍 Récupère tous les types de processus d'un tenant spécifique
   */
  async findAll(tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException("Le paramètre tenantId est requis pour filtrer les données.");
    }

    return this.prisma.processType.findMany({
      where: { tenantId },
      orderBy: { PT_Label: 'asc' },
    });
  }

  /**
   * 🆕 Crée un nouveau type de processus lié obligatoirement à un tenant
   */
  async create(data: any) {
    // Sécurité : On s'assure que le tenantId est présent dans la requête
    if (!data.tenantId) {
      throw new BadRequestException("L'identifiant du tenant (tenantId) est obligatoire pour la création.");
    }

    // On utilise la structure Prisma recommandée pour lier les relations
    return this.prisma.processType.create({
      data: {
        PT_Label: data.PT_Label,
        PT_Description: data.PT_Description,
        PT_Color: data.PT_Color || "#3b82f6",
        PT_Family: data.PT_Family,
        PT_IsActive: data.PT_IsActive ?? true,
        // ✅ Liaison cruciale avec le Tenant
        tenant: {
          connect: { T_Id: data.tenantId }
        }
      },
    });
  }

  /**
   * 🆙 Met à jour un type de processus
   */
  async update(id: string, data: any) {
    try {
      return await this.prisma.processType.update({
        where: { PT_Id: id },
        data: {
          PT_Label: data.PT_Label,
          PT_Description: data.PT_Description,
          PT_Color: data.PT_Color,
          PT_Family: data.PT_Family,
          PT_IsActive: data.PT_IsActive,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Impossible de mettre à jour : le type de processus ${id} est introuvable.`);
    }
  }

  /**
   * ❌ Supprime un type de processus (Delete Cascade géré par Prisma)
   */
  async remove(id: string) {
    try {
      return await this.prisma.processType.delete({
        where: { PT_Id: id },
      });
    } catch (error) {
      throw new NotFoundException(`Échec de la suppression : le type de processus ${id} n'existe pas.`);
    }
  }
}