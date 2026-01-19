import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpositionService {
  private readonly logger = new Logger(ExpositionService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 🔍 CALCUL DE L'EXPOSITION INDIVIDUELLE
   * Croise l'unité organique du collaborateur avec les risques rattachés
   */
  async getCollaborateurExposition(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { U_Id: userId, tenantId },
      include: {
        U_OrgUnit: {
          include: {
            // On récupère les risques liés au processus de cette unité ou au site
            OU_Site: { include: { S_SSEEvents: true } }
          }
        }
      }
    });

    if (!user) throw new NotFoundException("Collaborateur introuvable.");

    // Récupération des risques liés à l'Unité Organique (via le processus ou le site)
    const risquesProfessionnels = await this.prisma.risk.findMany({
      where: {
        tenantId,
        RS_Processus: {
          PR_Id: user.U_OrgUnitId || undefined
        }
      },
      include: { RS_Type: true }
    });

    return {
      collaborateur: `${user.U_FirstName} ${user.U_LastName}`,
      unite: user.U_OrgUnit?.OU_Name || "Non affecté",
      risques: risquesProfessionnels.map(r => ({
        id: r.RS_Id,
        libelle: r.RS_Libelle,
        type: r.RS_Type.RT_Label,
        score: r.RS_Score,
        mesures: r.RS_Mesures
      }))
    };
  }

  /**
   * ✅ MATRICE D'EXPOSITION GLOBALE
   * Pour le pilotage HSE : qui est exposé à quoi dans l'entreprise ?
   */
  async getGlobalExpositionMatrix(tenantId: string) {
    return this.prisma.orgUnit.findMany({
      where: { tenantId },
      include: {
        OU_Users: { select: { U_FirstName: true, U_LastName: true } },
        OU_Site: { 
          include: { 
            S_OrgUnits: { include: { OU_Type: true } } 
          } 
        }
      }
    });
  }
}