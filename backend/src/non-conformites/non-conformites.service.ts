import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NCSource, NCStatus, NCGravity, ActionStatus, ActionOrigin } from '@prisma/client';

@Injectable()
export class NonConformiteService {
  private readonly logger = new Logger(NonConformiteService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LISTE : Isolation Tenant
   */
  async findAll(tenantId: string, processusId?: string) {
    return this.prisma.nonConformite.findMany({
      where: { 
        tenantId,
        ...(processusId && { NC_ProcessusId: processusId })
      },
      include: {
        NC_Processus: { select: { PR_Libelle: true, PR_Code: true } },
        NC_Detector: { select: { U_FirstName: true, U_LastName: true } },
        NC_Actions: { select: { ACT_Title: true, ACT_Status: true } },
      },
      orderBy: { NC_CreatedAt: 'desc' }
    });
  }

  /**
   * ✅ UNITAIRE : Détail du dossier
   */
  async findOne(id: string, tenantId: string) {
    const nc = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId },
      include: {
        NC_Processus: { include: { PR_Pilote: true } },
        NC_Detector: true,
        NC_Actions: true,
        NC_Preuves: true
      }
    });
    if (!nc) throw new NotFoundException("Dossier NC introuvable.");
    return nc;
  }

  /**
   * ✅ CRÉATION : Sécurisation des relations (PR_Id, U_Id)
   */
  async create(data: any, tenantId: string) {
    try {
      // Construction dynamique des connecteurs de relation
      const connectRelations: any = {
        tenant: { connect: { T_Id: tenantId } }
      };

      if (data.NC_ProcessusId) connectRelations.NC_Processus = { connect: { PR_Id: data.NC_ProcessusId } };
      if (data.NC_DetectorId) connectRelations.NC_Detector = { connect: { U_Id: data.NC_DetectorId } };
      if (data.NC_AuditId) connectRelations.NC_Audit = { connect: { AU_Id: data.NC_AuditId } };
      if (data.NC_ReclamationId) connectRelations.NC_Reclamation = { connect: { REC_Id: data.NC_ReclamationId } };

      return await this.prisma.nonConformite.create({
        data: {
          NC_Libelle: data.NC_Libelle,
          NC_Description: data.NC_Description,
          NC_Diagnostic: data.NC_Diagnostic || "",
          NC_Gravite: (data.NC_Gravite as NCGravity) || NCGravity.MINEURE,
          NC_Statut: NCStatus.DETECTION,
          NC_Source: (data.NC_Source as NCSource) || NCSource.INTERNAL_AUDIT,
          ...connectRelations
        }
      });
    } catch (error: any) {
      // ✅ FIX TS18046 : Utilisation de error: any ou typage explicite
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`Erreur création NC : ${msg}`);
      throw new BadRequestException(`Échec de création : Vérifiez les IDs de relation.`);
    }
  }

  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId }
    });
    if (!existing) throw new NotFoundException("NC introuvable.");

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
    return this.prisma.nonConformite.deleteMany({ where: { NC_Id: id, tenantId } });
  }

  /**
   * 🚀 CAPA : Lien avec le Plan d'Actions (PAQ)
   */
  async linkToPAQ(ncId: string, userId: string, tenantId: string) {
    const nc = await this.findOne(ncId, tenantId);
    if (!nc.NC_ProcessusId) throw new BadRequestException("Liez d'abord un processus.");

    const paq = await this.prisma.pAQ.findFirst({
      where: { tenantId, PAQ_ProcessusId: nc.NC_ProcessusId },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException("Aucun PAQ actif trouvé.");

    return this.prisma.action.create({
      data: {
        ACT_Title: `[CAPA] Correction NC : ${nc.NC_Libelle}`,
        ACT_Description: `Action corrective générée depuis le SMI.`,
        ACT_Origin: ActionOrigin.NON_CONFORMITE,
        ACT_Status: ActionStatus.A_FAIRE,
        ACT_PAQ: { connect: { PAQ_Id: paq.PAQ_Id } },
        ACT_NC: { connect: { NC_Id: nc.NC_Id } },
        ACT_Responsable: { connect: { U_Id: userId } },
        ACT_Creator: { connect: { U_Id: userId } },
        tenant: { connect: { T_Id: tenantId } },
      }
    });
  }
}