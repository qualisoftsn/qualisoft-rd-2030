import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);

  constructor(private prisma: PrismaService) {}

  // 📈 1. POUR ANALYTICS : Renvoie les données brutes complètes
  async findAll(T_Id: string) {
    return this.prisma.sSEEvent.findMany({
      where: { tenantId: T_Id },
      include: {
        SSE_Site: { select: { S_Name: true } },
        SSE_Processus: { select: { PR_Libelle: true } }
      },
      orderBy: { SSE_DateEvent: 'desc' }
    });
  }

  // 🛡️ 2. POUR LA MATRICE DES RISQUES (DUER) - FONCTIONNALITÉ VALIDÉE
  async findAllRisks(T_Id: string) {
    const risks = await this.prisma.risk.findMany({
      where: { tenantId: T_Id },
      include: {
        RS_Processus: { select: { PR_Libelle: true } }
      },
      orderBy: { RS_UpdatedAt: 'desc' }
    });

    return risks.map(r => ({
      id: r.RS_Id,
      title: r.RS_Libelle,
      processus: r.RS_Processus?.PR_Libelle || 'Non assigné',
      prob: r.RS_Probabilite || 1,
      grav: r.RS_Gravite || 1,
      c: (r.RS_Probabilite || 1) * (r.RS_Gravite || 1), // Score de criticité
      status: r.RS_Status || 'IDENTIFIE'
    }));
  }

  // 📝 3. CRÉATION SÉCURISÉE AVEC CALCUL AUTO TF/TG
  async create(data: any, T_Id: string, U_Id: string) {
    let siteId = data.SSE_SiteId;
    if (!siteId) {
      const firstSite = await this.prisma.site.findFirst({ where: { tenantId: T_Id } });
      if (!firstSite) throw new BadRequestException("Aucun site configuré pour ce Tenant.");
      siteId = firstSite.S_Id;
    }

    // Utilisation d'une transaction pour garantir la mise à jour des stats
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.sSEEvent.create({
        data: {
          SSE_Type: data.SSE_Type,
          SSE_Lieu: data.SSE_Lieu,
          SSE_Description: data.SSE_Description,
          SSE_AvecArret: data.SSE_AvecArret || false,
          SSE_NbJoursArret: Number(data.SSE_NbJoursArret) || 0,
          tenantId: T_Id,
          SSE_ReporterId: U_Id,
          SSE_SiteId: siteId,
          SSE_DateEvent: data.SSE_DateEvent ? new Date(data.SSE_DateEvent) : new Date(),
          SSE_ProcessusId: data.SSE_ProcessusId || null,
        }
      });

      // 🛠️ AUTOMATISATION : Mise à jour des stats si c'est un accident
      if (['ACCIDENT_TRAVAIL', 'ACCIDENT_TRAVAIL_TRAJET'].includes(data.SSE_Type)) {
        await this.computeMonthlyStats(tx, T_Id, event.SSE_DateEvent);
      }

      return event;
    });
  }

  /**
   * 📉 CALCUL DES TAUX DE FRÉQUENCE ET GRAVITÉ (TF/TG)
   * Résolution de la dette technique : Calcul automatique ISO
   */
  private async computeMonthlyStats(tx: any, T_Id: string, date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const accidents = await tx.sSEEvent.findMany({
      where: {
        tenantId: T_Id,
        SSE_DateEvent: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
        SSE_Type: { in: ['ACCIDENT_TRAVAIL', 'ACCIDENT_TRAVAIL_TRAJET'] },
      },
    });

    const nbAccidents = accidents.length;
    const nbJoursArret = accidents.reduce((sum, acc) => sum + (acc.SSE_NbJoursArret || 0), 0);
    
    // Base standard : 200 000 heures ou selon effectif (Dette RH à venir)
    const heuresTravaillees = 200000; 
    const tf = (nbAccidents * 1000000) / heuresTravaillees;
    const tg = (nbJoursArret * 1000) / heuresTravaillees;

    await tx.sSEStats.upsert({
      where: { ST_Id: `${T_Id}-${month}-${year}` }, // Identifiant unique composite
      update: {
        ST_NbAccidents: nbAccidents,
        ST_TauxFrequence: tf,
        ST_TauxGravite: tg,
      },
      create: {
        ST_Id: `${T_Id}-${month}-${year}`,
        ST_Mois: month,
        ST_Annee: year,
        ST_NbAccidents: nbAccidents,
        ST_TauxFrequence: tf,
        ST_TauxGravite: tg,
        tenantId: T_Id,
      },
    });
  }

  // 🗑️ 4. SUPPRESSION - FONCTIONNALITÉ VALIDÉE
  async delete(id: string, T_Id: string) {
    const event = await this.prisma.sSEEvent.findFirst({
      where: { SSE_Id: id, tenantId: T_Id }
    });
    if (!event) throw new NotFoundException("Événement introuvable");

    return this.prisma.sSEEvent.delete({
      where: { SSE_Id: id }
    });
  }
}