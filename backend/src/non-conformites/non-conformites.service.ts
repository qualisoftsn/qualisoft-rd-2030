import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service'; // 👈 IMPORT CRUCIAL
import { 
  NCSource, NCStatus, NCGravity, 
  ActionStatus, ActionOrigin, NotificationType 
} from '@prisma/client';

@Injectable()
export class NonConformiteService {
  private readonly logger = new Logger(NonConformiteService.name);

  constructor(
    private prisma: PrismaService,
    private notifService: NotificationsService // 👈 Injection pour les alertes
  ) {}

  /**
   * ✅ LISTE : Isolation Tenant
   * Récupère les NC avec les infos vitales pour le tableau de bord.
   */
  async findAll(tenantId: string, processusId?: string) {
    return this.prisma.nonConformite.findMany({
      where: { 
        tenantId,
        ...(processusId && { NC_ProcessusId: processusId })
      },
      include: {
        NC_Processus: { select: { PR_Libelle: true, PR_Code: true, PR_PiloteId: true } },
        NC_Detector: { select: { U_FirstName: true, U_LastName: true } },
        NC_Actions: { select: { ACT_Title: true, ACT_Status: true } },
      },
      orderBy: { NC_CreatedAt: 'desc' }
    });
  }

  /**
   * ✅ UNITAIRE : Détail complet du dossier
   */
  async findOne(id: string, tenantId: string) {
    const nc = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId },
      include: {
        NC_Processus: { include: { PR_Pilote: true } },
        NC_Detector: true,
        NC_Actions: { include: { ACT_Responsable: true } }, // On veut voir qui gère les actions
        NC_Preuves: true
      }
    });
    
    if (!nc) throw new NotFoundException("Dossier NC introuvable.");
    return nc;
  }

  /**
   * ✅ CRÉATION : Enregistrement + Notification Pilote
   */
  async create(data: any, tenantId: string) {
    try {
      // 1. Préparation des relations dynamiques
      const connectData: any = {
        tenant: { connect: { T_Id: tenantId } }
      };

      if (data.NC_ProcessusId) connectData.NC_Processus = { connect: { PR_Id: data.NC_ProcessusId } };
      if (data.NC_DetectorId) connectData.NC_Detector = { connect: { U_Id: data.NC_DetectorId } };
      if (data.NC_AuditId) connectData.NC_Audit = { connect: { AU_Id: data.NC_AuditId } };
      if (data.NC_ReclamationId) connectData.NC_Reclamation = { connect: { REC_Id: data.NC_ReclamationId } };

      // 2. Création en base
      const nc = await this.prisma.nonConformite.create({
        data: {
          NC_Libelle: data.NC_Libelle,
          NC_Description: data.NC_Description,
          NC_Diagnostic: data.NC_Diagnostic || "",
          NC_Gravite: (data.NC_Gravite as NCGravity) || NCGravity.MINEURE,
          NC_Statut: NCStatus.DETECTION,
          NC_Source: (data.NC_Source as NCSource) || NCSource.INTERNAL_AUDIT,
          ...connectData
        },
        include: { NC_Processus: true } // Important pour récupérer le pilote
      });

      // 3. 🔥 DÉCLENCHEMENT ALERTE AUTOMATIQUE
      // Si un processus est lié, on notifie son Pilote
      if (nc.NC_Processus?.PR_PiloteId) {
        await this.notifService.createNotification(
          nc.NC_Processus.PR_PiloteId,
          "⚠️ NOUVELLE NC DÉTECTÉE",
          `Une non-conformité "${nc.NC_Libelle}" a été ouverte sur votre processus ${nc.NC_Processus.PR_Libelle}.`,
          NotificationType.WARNING,
          tenantId
        );
      }

      return nc;

    } catch (error: any) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`Erreur création NC : ${msg}`);
      throw new BadRequestException(`Échec de création : Vérifiez les données envoyées.`);
    }
  }

  /**
   * ✅ MISE À JOUR : Analyse & Statut
   */
  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId }
    });
    if (!existing) throw new NotFoundException("NC introuvable.");

    // Si on clôture, on pourrait notifier le déclarant (A implémenter plus tard)
    
    return this.prisma.nonConformite.update({
      where: { NC_Id: id },
      data: {
        NC_Libelle: data.NC_Libelle,
        NC_Description: data.NC_Description,
        NC_Diagnostic: data.NC_Diagnostic,
        NC_Gravite: data.NC_Gravite as NCGravity,
        NC_Statut: data.NC_Statut as NCStatus,
      }
    });
  }

  async remove(id: string, tenantId: string) {
    // Suppression sécurisée (Cascade gérée par Prisma normalement, sinon attention aux orphelins)
    return this.prisma.nonConformite.deleteMany({ where: { NC_Id: id, tenantId } });
  }

  /**
   * 🚀 CAPA : Génération automatique d'Action Corrective
   * Relie la NC -> Action -> PAQ du Processus
   */
  async linkToPAQ(ncId: string, userId: string, tenantId: string) {
    // 1. Récupération de la NC
    const nc = await this.findOne(ncId, tenantId);
    if (!nc.NC_ProcessusId) throw new BadRequestException("Impossible de lier au PAQ : Aucun processus défini pour cette NC.");

    // 2. Recherche du PAQ actif pour ce processus (Année en cours ou plus récent)
    const currentYear = new Date().getFullYear();
    let paq = await this.prisma.pAQ.findFirst({
      where: { 
        tenantId, 
        PAQ_ProcessusId: nc.NC_ProcessusId,
        PAQ_Year: currentYear 
      }
    });

    // Fallback : Si pas de PAQ cette année, on prend le dernier créé
    if (!paq) {
        paq = await this.prisma.pAQ.findFirst({
            where: { tenantId, PAQ_ProcessusId: nc.NC_ProcessusId },
            orderBy: { PAQ_Year: 'desc' }
        });
    }

    if (!paq) throw new BadRequestException("Aucun PAQ (Plan d'Action Qualité) n'existe pour ce processus. Veuillez en créer un d'abord.");

    // 3. Création de l'Action
    const action = await this.prisma.action.create({
      data: {
        ACT_Title: `[CORRECTIF] ${nc.NC_Libelle}`,
        ACT_Description: `Action générée suite à la NC #${nc.NC_Id.split('-')[0]}.`,
        ACT_Origin: ActionOrigin.NON_CONFORMITE,
        ACT_Type: 'CORRECTIVE', // Enum ActionType
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_Priority: 'HIGH', // Les correctifs sont souvent urgents
        
        // Liaisons
        ACT_PAQ: { connect: { PAQ_Id: paq.PAQ_Id } },
        ACT_NC: { connect: { NC_Id: nc.NC_Id } },
        ACT_Responsable: { connect: { U_Id: userId } }, // On assigne par défaut à celui qui clique (à changer via UI)
        ACT_Creator: { connect: { U_Id: userId } },
        tenant: { connect: { T_Id: tenantId } },
      }
    });

    // 4. Notification au Responsable de l'Action (ici c'est le même, mais pour la forme)
    await this.notifService.createNotification(
        userId,
        "NOUVELLE ACTION ASSIGNÉE",
        `Vous êtes responsable de l'action corrective "${action.ACT_Title}".`,
        NotificationType.INFO,
        tenantId
    );

    return action;
  }
}