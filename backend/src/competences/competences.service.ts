import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompetencesService {
  private readonly logger = new Logger(CompetencesService.name);

  constructor(private prisma: PrismaService) {}

  // ======================================================
  // 📊 ZONE 1 : MATRICE DE POLYVALENCE (ISO 9001)
  // ======================================================

  /**
   * ✅ MATRICE : Récupération croisée Utilisateurs / Compétences
   * Permet de visualiser les écarts entre niveau requis et niveau actuel
   */
  async getMatrix(T_Id: string) {
    const [competences, users] = await Promise.all([
      this.prisma.competence.findMany({
        where: { tenantId: T_Id },
        orderBy: { CP_Name: 'asc' }
      }),
      this.prisma.user.findMany({
        where: { tenantId: T_Id, U_IsActive: true },
        select: {
          U_Id: true,
          U_FirstName: true,
          U_LastName: true,
          U_Role: true,
          U_Competences: {
            select: { UC_CompetenceId: true, UC_NiveauActuel: true }
          }
        }
      })
    ]);

    return { competences, users };
  }

  /**
   * ✅ RÉFÉRENTIEL : CRÉATION D'UNE COMPÉTENCE
   */
  async create(data: any, T_Id: string) {
    if (!data.CP_Name) {
      throw new BadRequestException("Le nom de la compétence est requis.");
    }
    return this.prisma.competence.create({
      data: {
        CP_Name: data.CP_Name,
        CP_NiveauRequis: Number(data.CP_NiveauRequis) || 3,
        tenantId: T_Id,
      }
    });
  }

  /**
   * ✅ ÉVALUATION : MISE À JOUR DU NIVEAU (UPSERT)
   * Enregistre ou met à jour le niveau d'un collaborateur sur une compétence
   */
  async evaluate(data: any, T_Id: string) {
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

  // ======================================================
  // 🛡️ ZONE 2 : HABILITATIONS & CONFORMITÉ SSE
  // ======================================================

  /**
   * ✅ SURVEILLANCE : LISTE DES HABILITATIONS EN EXPIRATION
   * Alerte pour les CACES, Habilitations Électriques, etc. (Seuil 30 jours)
   */
  async getExpiringHabilitations(T_Id: string) {
    const alertThreshold = new Date();
    alertThreshold.setDate(alertThreshold.getDate() + 30);

    return this.prisma.userHabilitation.findMany({
      where: {
        tenantId: T_Id,
        UH_ExpiryDate: { lte: alertThreshold }
      },
      include: { 
        UH_User: { select: { U_FirstName: true, U_LastName: true } } 
      },
      orderBy: { UH_ExpiryDate: 'asc' }
    });
  }

  // ======================================================
  // 🛠️ ZONE 3 : ADMINISTRATION
  // ======================================================

  /**
   * ✅ SUPPRESSION : RETRAIT D'UNE COMPÉTENCE DU RÉFÉRENTIEL
   */
  async remove(id: string, T_Id: string) {
    return this.prisma.competence.deleteMany({
      where: { CP_Id: id, tenantId: T_Id }
    });
  }
}