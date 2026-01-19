import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SSEType } from '@prisma/client';

@Injectable()
export class SseService {
  private readonly logger = new Logger(SseService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * 📈 REGISTRE DES ÉVÉNEMENTS
   * Utilise les relations définies dans le schéma (SSE_Site, SSE_Processus)
   */
  async findAll(tenantId: string) {
    return this.prisma.sSEEvent.findMany({
      where: { tenantId },
      include: {
        SSE_Site: { select: { S_Name: true } },
        SSE_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        SSE_Reporter: { select: { U_FirstName: true, U_LastName: true } }
      },
      orderBy: { SSE_DateEvent: 'desc' }
    });
  }

  /**
   * 🛡️ MATRICE DES RISQUES PROFESSIONNELS (DUER)
   * Alignement sur le modèle Risk (RS_Score, RS_Probabilite, etc.)
   */
  async findAllRisks(tenantId: string) {
    const risks = await this.prisma.risk.findMany({
      where: { tenantId },
      include: {
        RS_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        RS_Type: true
      },
      orderBy: { RS_Score: 'desc' }
    });

    return risks.map(r => ({
      id: r.RS_Id,
      libelle: r.RS_Libelle,
      processus: r.RS_Processus?.PR_Libelle || 'SMI',
      score: r.RS_Score,
      prob: r.RS_Probabilite,
      grav: r.RS_Gravite,
      status: r.RS_Status
    }));
  }

  /**
   * 📝 CRÉATION & CALCUL TF/TG
   * Transactionnelle pour impacter la table SSEStats
   */
  async create(data: any, tenantId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Validation du Site
      let siteId = data.SSE_SiteId;
      if (!siteId) {
        const site = await tx.site.findFirst({ where: { tenantId } });
        if (!site) throw new BadRequestException("Aucun site configuré.");
        siteId = site.S_Id;
      }

      // 2. Création de l'événement
      const event = await tx.sSEEvent.create({
        data: {
          SSE_Type: data.SSE_Type as SSEType,
          SSE_Lieu: data.SSE_Lieu,
          SSE_Description: data.SSE_Description,
          SSE_AvecArret: data.SSE_AvecArret || false,
          SSE_NbJoursArret: Number(data.SSE_NbJoursArret) || 0,
          SSE_DateEvent: data.SSE_DateEvent ? new Date(data.SSE_DateEvent) : new Date(),
          SSE_ReporterId: userId,
          SSE_SiteId: siteId,
          SSE_ProcessusId: data.SSE_ProcessusId || null,
          tenantId: tenantId,
        }
      });

      // 3. Si Accident de travail, mise à jour des stats mensuelles (ST_Id)
      if (['ACCIDENT_TRAVAIL', 'ACCIDENT_TRAVAIL_TRAJET'].includes(data.SSE_Type)) {
        await this.computeStats(tx, tenantId, event.SSE_DateEvent);
      }

      return event;
    });
  }

  private async computeStats(tx: any, tenantId: string, date: Date) {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const accidents = await tx.sSEEvent.findMany({
      where: {
        tenantId,
        SSE_DateEvent: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
        SSE_Type: { in: ['ACCIDENT_TRAVAIL', 'ACCIDENT_TRAVAIL_TRAJET'] },
      },
    });

    const nbAccidents = accidents.length;
    const nbJoursArret = accidents.reduce((sum: number, acc: any) => sum + (acc.SSE_NbJoursArret || 0), 0);
    const heuresTravaillees = 200000; // Base théorique à affiner via RH

    const tf = (nbAccidents * 1000000) / heuresTravaillees;
    const tg = (nbJoursArret * 1000) / heuresTravaillees;

    // Utilisation de findFirst/upsert sans l'ID composite si non défini, 
    // ou création d'une logique d'ID unique pour SSEStats
    await tx.sseStats.create({
        data: {
            ST_Mois: month,
            ST_Annee: year,
            ST_NbAccidents: nbAccidents,
            ST_TauxFrequence: tf,
            ST_TauxGravite: tg,
            tenantId: tenantId
        }
    });
  }

  async delete(id: string, tenantId: string) {
    const event = await this.prisma.sSEEvent.findFirst({ where: { SSE_Id: id, tenantId } });
    if (!event) throw new NotFoundException("Événement introuvable.");
    return this.prisma.sSEEvent.delete({ where: { SSE_Id: id } });
  }
}