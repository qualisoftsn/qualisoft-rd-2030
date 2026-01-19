import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { ActionStatus } from '@prisma/client';

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);

  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService // ✅ Intelligence Active : Lien vers les alertes
  ) {}

  /**
   * 📊 STATISTIQUES DASHBOARD : CALCUL PRÉCIS QHSE-E AVEC SEUILS D'ALERTE
   * Agrégation en temps réel et évaluation de la santé visuelle du système
   */
  async getDashboardStats(T_Id: string) {
    if (!T_Id) {
      throw new UnauthorizedException("Identifiant entreprise (TenantId) manquant.");
    }

    try {
      // 1. Exécution des requêtes en parallèle (Transaction multi-tables)
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

      const [ncs, sses, docs, processus, paqs, accidentsArret, joursPerdusAgg] = counts;

      // 2. Calcul des statistiques des actions (PDCA)
      const total = allActions.length;
      const termine = allActions.filter(a => a.ACT_Status === ActionStatus.TERMINEE).length;
      const today = new Date();
      const enRetard = allActions.filter(a => 
        a.ACT_Status !== ActionStatus.TERMINEE && 
        a.ACT_Deadline && new Date(a.ACT_Deadline) < today
      ).length;

      const tauxRealisation = total > 0 ? Math.round((termine / total) * 100) : 0;

      // ======================================================
      // 🚨 LOGIQUE DE VISIBILITÉ ÉLITE : SEUILS DE SANTÉ (HEALTH CHECK)
      // ======================================================
      let performanceStatus: 'GREEN' | 'ORANGE' | 'RED' = 'GREEN';
      let statusMessage = "Le SMI est sous contrôle.";

      if (tauxRealisation < 70 || accidentsArret > 0) {
        performanceStatus = 'RED';
        statusMessage = "ALERTE CRITIQUE : Performance dégradée ou accident détecté.";
      } else if (tauxRealisation < 90 || enRetard > 5) {
        performanceStatus = 'ORANGE';
        statusMessage = "VIGILANCE : Plusieurs actions sont en retard.";
      }

      // 3. Construction du Dashboard consolidé
      const result = {
        enterpriseName: tenantInfo?.T_Name || "Entreprise non identifiée",
        healthCheck: {
          status: performanceStatus,
          message: statusMessage,
          globalScore: tauxRealisation
        },
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
          total,
          termine,
          enRetard,
          tauxRealisation
        }
      };

      this.logger.debug(`Dashboard ${result.enterpriseName} : Statut ${performanceStatus}`);
      return result;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`Erreur Prisma dans getDashboardStats: ${errorMessage}`);
      throw error;
    }
  }
}