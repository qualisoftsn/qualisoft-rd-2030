import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActionStatus } from '@prisma/client';

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);

  constructor(private prisma: PrismaService) {}

  async getDashboardStats(T_Id: string) {
    if (!T_Id) {
      throw new UnauthorizedException("Identifiant entreprise (TenantId) manquant.");
    }

    try {
      // Exécution de toutes les requêtes en parallèle (Counts, Actions, et Infos Entreprise)
      const [counts, allActions, tenantInfo] = await Promise.all([
        this.prisma.$transaction([
          this.prisma.nonConformite.count({ where: { tenantId: T_Id } }),
          this.prisma.sSEEvent.count({ where: { tenantId: T_Id } }),
          this.prisma.document.count({ where: { tenantId: T_Id } }),
          this.prisma.processus.count({ where: { tenantId: T_Id } }),
          this.prisma.pAQ.count({ where: { tenantId: T_Id } }),
          this.prisma.sSEEvent.count({ 
            where: { tenantId: T_Id, SSE_AvecArret: true } 
          }),
          this.prisma.sSEEvent.aggregate({
            where: { tenantId: T_Id },
            _sum: { SSE_NbJoursArret: true }
          })
        ]),
        this.prisma.action.findMany({
          where: { tenantId: T_Id },
          select: { ACT_Status: true, ACT_Deadline: true }
        }),
        this.prisma.tenant.findUnique({
          where: { T_Id: T_Id },
          select: { T_Name: true }
        })
      ]);

      // Extraction des résultats de la transaction
      const [
        ncs, 
        sses, 
        docs, 
        processus, 
        paqs, 
        accidentsArret, 
        joursPerdusAgg
      ] = counts;

      // Calcul des statistiques des actions
      const total = allActions.length;
      const termine = allActions.filter(a => a.ACT_Status === ActionStatus.TERMINEE).length;
      const enCours = allActions.filter(a => a.ACT_Status === ActionStatus.EN_COURS).length;
      const aFaire = allActions.filter(a => a.ACT_Status === ActionStatus.A_FAIRE).length;
      
      const today = new Date();
      const enRetard = allActions.filter(a => 
        a.ACT_Status !== ActionStatus.TERMINEE && 
        a.ACT_Deadline && new Date(a.ACT_Deadline) < today
      ).length;

      // Construction de la réponse finale
      const result = {
        enterpriseName: tenantInfo?.T_Name || "Entreprise non identifiée",
        counts: {
          processus: processus || 0,
          paq: paqs || 0,
          ncs: ncs || 0,
          sses: sses || 0,
          docs: docs || 0,
          sseAccidentsArret: accidentsArret || 0,
          sseJoursPerdus: joursPerdusAgg?._sum?.SSE_NbJoursArret || 0
        },
        actions: {
          total: total || 0,
          termine: termine || 0,
          enCours: enCours || 0,
          aFaire: aFaire || 0,
          enRetard: enRetard || 0,
          tauxRealisation: total > 0 ? Math.round((termine / total) * 100) : 0
        }
      };

      // Log de diagnostic dans le terminal
      this.logger.debug(`Données pour ${result.enterpriseName} (${T_Id}) : NC=${ncs}, Actions=${total}`);

      return result;

    } catch (error: any) {
      this.logger.error(`Erreur Prisma dans getDashboardStats: ${error.message}`);
      throw error;
    }
  }
}