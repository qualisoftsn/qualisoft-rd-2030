import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompetencesService {
  constructor(private prisma: PrismaService) {}

  async getMatrix(T_Id: string) {
    // 1. Récupérer le référentiel des compétences du client
    const competences = await this.prisma.competence.findMany({
      where: { tenantId: T_Id },
      orderBy: { CP_Name: 'asc' }
    });

    // 2. Récupérer les utilisateurs avec leurs évaluations liées
    const users = await this.prisma.user.findMany({
      where: { tenantId: T_Id, U_IsActive: true },
      select: {
        U_Id: true,
        U_FirstName: true,
        U_LastName: true,
        U_Role: true,
        U_Competences: {
          select: {
            UC_CompetenceId: true,
            UC_NiveauActuel: true
          }
        }
      }
    });

    return { competences, users };
  }

  async create(data: any, T_Id: string) {
    return this.prisma.competence.create({
      data: {
        CP_Name: data.CP_Name,
        CP_NiveauRequis: Number(data.CP_NiveauRequis) || 3,
        tenantId: T_Id,
      }
    });
  }

  async evaluate(data: any, T_Id: string) {
    // 🛡️ L'ID de relation est UC_UserId_UC_CompetenceId selon ton schéma
    return this.prisma.userCompetence.upsert({
      where: {
        UC_UserId_UC_CompetenceId: {
          UC_UserId: data.userId,
          UC_CompetenceId: data.compId
        }
      },
      update: { UC_NiveauActuel: Number(data.level) },
      create: {
        UC_UserId: data.userId,
        UC_CompetenceId: data.compId,
        UC_NiveauActuel: Number(data.level)
      }
    });
  }

  async remove(id: string, T_Id: string) {
    return this.prisma.competence.deleteMany({
      where: { 
        CP_Id: id, 
        tenantId: T_Id 
      }
    });
  }
}