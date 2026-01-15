import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SseService {
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

  // 🛡️ 2. POUR LA MATRICE DES RISQUES (DUER)
  // On récupère les vrais risques de la table 'Risk' du schéma
  async findAllRisks(T_Id: string) {
    const risks = await this.prisma.risk.findMany({
      where: { tenantId: T_Id },
      include: {
        RS_Processus: { select: { PR_Libelle: true } }
      },
      orderBy: { RS_UpdatedAt: 'desc' }
    });

    // On mappe pour le frontend de la matrice
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

  // 📝 3. CRÉATION SÉCURISÉE
  async create(data: any, T_Id: string, U_Id: string) {
    let siteId = data.SSE_SiteId;
    if (!siteId) {
      const firstSite = await this.prisma.site.findFirst({ where: { tenantId: T_Id } });
      if (!firstSite) throw new BadRequestException("Aucun site configuré pour ce Tenant.");
      siteId = firstSite.S_Id;
    }

    return this.prisma.sSEEvent.create({
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
  }

  // 🗑️ 4. SUPPRESSION
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