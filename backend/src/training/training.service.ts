import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingService {
  constructor(private prisma: PrismaService) {}

  /**
   * Met à jour ou crée une compétence pour un utilisateur
   */
  async updateCompetence(userId: string, competenceId: string, niveau: number) {
    return this.prisma.userCompetence.upsert({
      where: {
        // Utilisation de la clé composite générée par Prisma @@id([UC_UserId, UC_CompetenceId])
        UC_UserId_UC_CompetenceId: {
          UC_UserId: userId,
          UC_CompetenceId: competenceId,
        },
      },
      update: {
        UC_NiveauActuel: niveau,
      },
      create: {
        UC_UserId: userId,
        UC_CompetenceId: competenceId,
        UC_NiveauActuel: niveau,
      },
    });
  }

  /**
   * Récupère toutes les compétences d'un utilisateur avec les détails du libellé
   */
  async getCompetencesByUser(userId: string) {
    return this.prisma.userCompetence.findMany({
      where: { UC_UserId: userId },
      include: {
        UC_Competence: true, // Inclut le modèle Competence (CP_Name, CP_NiveauRequis)
      },
    });
  }

  /**
   * Liste les compétences par Tenant
   */
  async findAllCompetences(T_Id: string) {
    return this.prisma.competence.findMany({
      where: { tenantId: T_Id },
      include: {
        _count: {
          select: { CP_Users: true },
        },
      },
    });
  }
}