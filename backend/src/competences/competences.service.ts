import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompetencesService {
  constructor(private prisma: PrismaService) {}

  /** ✅ MATRIX : Récupération croisée Users / Competences */
  async getMatrix(tenantId: string) {
    const [competences, users] = await Promise.all([
      this.prisma.competence.findMany({
        where: { tenantId, CP_IsActive: true },
        orderBy: { CP_Name: 'asc' }
      }),
      this.prisma.user.findMany({
        where: { tenantId, U_IsActive: true },
        select: {
          U_Id: true,
          U_FirstName: true,
          U_LastName: true,
          U_Role: true,
          U_Competences: {
            where: { UC_IsActive: true },
            select: { UC_CompetenceId: true, UC_NiveauActuel: true }
          }
        }
      })
    ]);
    return { competences, users };
  }

  /** ✅ EVALUATE : Upsert sur la table de liaison UserCompetence */
  async evaluate(data: { userId: string, competenceId: string, level: number }, tenantId: string) {
    return this.prisma.userCompetence.upsert({
      where: {
        UC_UserId_UC_CompetenceId: {
          UC_UserId: data.userId,
          UC_CompetenceId: data.competenceId
        }
      },
      update: { UC_NiveauActuel: data.level },
      create: {
        UC_UserId: data.userId,
        UC_CompetenceId: data.competenceId,
        UC_NiveauActuel: data.level
      }
    });
  }

  /** ✅ CRUD : Création de compétence */
  async create(data: any, tenantId: string) {
    return this.prisma.competence.create({
      data: {
        CP_Name: data.CP_Name,
        CP_NiveauRequis: Number(data.CP_NiveauRequis) || 3,
        tenantId: tenantId
      }
    });
  }

  /** ✅ ARCHIVE : On ne supprime pas, on bascule CP_IsActive */
  async remove(id: string, tenantId: string) {
    return this.prisma.competence.updateMany({
      where: { CP_Id: id, tenantId },
      data: { CP_IsActive: false }
    });
  }
}