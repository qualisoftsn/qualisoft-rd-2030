import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditsService {
  private readonly logger = new Logger(AuditsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * ✅ LISTE : Vision globale des audits (Planification annuelle)
   */
  async findAll(tenantId: string) {
    return this.prisma.audit.findMany({
      where: { tenantId },
      include: { 
        AU_Processus: { select: { PR_Libelle: true, PR_Code: true } }, 
        AU_Lead: { select: { U_FirstName: true, U_LastName: true } }, 
        AU_Site: { select: { S_Name: true } },
        AU_NonConformites: true,
        AU_Findings: true
      },
      orderBy: { AU_DateAudit: 'asc' }
    });
  }

  /**
   * ✅ UNIQUE : Détails complets pour consultation ou export PDF
   */
  async findOne(id: string, tenantId: string) {
    const audit = await this.prisma.audit.findFirst({
      where: { AU_Id: id, tenantId },
      include: {
        AU_Processus: {
          include: { PR_Pilote: true, PR_CoPilote: true }
        },
        AU_Lead: true,
        AU_Site: true,
        AU_Findings: true,
        AU_NonConformites: { 
          include: { NC_Actions: true, NC_Detector: true } 
        }
      }
    });
    if (!audit) throw new NotFoundException("Audit introuvable ou accès refusé.");
    return audit;
  }

  /**
   * ✅ PLANIFICATION : Créer un nouvel audit dans le calendrier
   */
  async create(data: any, tenantId: string) {
    return this.prisma.audit.create({
      data: {
        AU_Reference: data.AU_Reference || `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        AU_Title: data.AU_Title,
        AU_Scope: data.AU_Scope || "Périmètre SMI",
        AU_DateAudit: new Date(data.AU_DateAudit),
        AU_Status: 'PLANIFIE',
        tenantId: tenantId,
        AU_SiteId: data.AU_SiteId,
        AU_ProcessusId: data.AU_ProcessusId,
        AU_LeadId: data.AU_LeadId,
      }
    });
  }

  /**
   * ✅ ACCEPTATION : Signature électronique du Pilote de processus
   */
  async signAcceptance(auditId: string, userId: string, tenantId: string, hash: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { AU_Id: auditId },
      include: { AU_Processus: true }
    });

    if (!audit || audit.tenantId !== tenantId) throw new NotFoundException("Audit introuvable.");

    // Vérification des droits de signature (Pilote ou Co-Pilote du processus audité)
    const isPilote = audit.AU_Processus?.PR_PiloteId === userId;
    const isCoPilote = audit.AU_Processus?.PR_CoPiloteId === userId;

    if (!isPilote && !isCoPilote) {
      throw new ForbiddenException("Seul le Pilote ou Copilote du processus peut valider l'ouverture.");
    }

    await this.prisma.signature.create({
      data: {
        SIG_EntityType: 'AUDIT',
        SIG_EntityId: auditId,
        SIG_UserId: userId,
        tenantId: tenantId,
        SIG_Hash: hash
      }
    });

    return this.prisma.audit.update({
      where: { AU_Id: auditId },
      data: { AU_Status: 'EN_COURS' }
    });
  }

  /**
   * ✅ CLÔTURE & AMÉLIORATION CONTINUE
   * Génère les NC et injecte les actions correctives dans le PAQ Processus
   */
  async closeAuditWithReport(auditId: string, reportData: any, tenantId: string, auditorId: string) {
    const { findings, nonConformites } = reportData;

    return await this.prisma.$transaction(async (tx) => {
      const audit = await tx.audit.findUnique({ 
        where: { AU_Id: auditId },
        include: { AU_Processus: true }
      });

      if (!audit || audit.tenantId !== tenantId) throw new NotFoundException("Audit introuvable.");

      // 1. Enregistrement des constats (Findings : Points forts, Observations, NC)
      if (findings?.length > 0) {
        await tx.finding.createMany({
          data: findings.map((f: any) => ({
            FI_Description: f.FI_Description,
            FI_Type: f.FI_Type,
            FI_AuditId: auditId
          }))
        });
      }

      // 2. Traitement des Non-Conformités et liaison PAQ
      if (nonConformites?.length > 0) {
        for (const nc of nonConformites) {
          // Création de la NC officielle
          const createdNc = await tx.nonConformite.create({
            data: {
              NC_Libelle: nc.NC_Libelle,
              NC_Description: nc.NC_Description,
              NC_Gravite: nc.NC_Gravite || "MINEURE",
              NC_Statut: "DETECTION",
              NC_Source: 'INTERNAL_AUDIT',
              NC_AuditId: auditId,
              NC_ProcessusId: audit.AU_ProcessusId,
              NC_DetectorId: auditorId,
              tenantId: tenantId
            }
          });

          // Liaison automatique avec le PAQ du processus
          if (audit.AU_ProcessusId) {
            const paq = await tx.pAQ.findFirst({ 
              where: { 
                PAQ_ProcessusId: audit.AU_ProcessusId,
                PAQ_Year: new Date().getFullYear() // PAQ de l'année en cours
              } 
            });

            if (paq) {
              await tx.action.create({
                data: {
                  ACT_Title: `[AUDIT] Correctif : ${nc.NC_Libelle}`,
                  ACT_Origin: 'AUDIT',
                  ACT_Type: 'CORRECTIVE',
                  ACT_Status: 'A_FAIRE',
                  ACT_PAQId: paq.PAQ_Id,
                  ACT_AuditId: auditId,
                  ACT_NCId: createdNc.NC_Id,
                  tenantId: tenantId,
                  ACT_ResponsableId: audit.AU_LeadId || auditorId,
                  ACT_CreatorId: auditorId
                }
              });
            }
          }
        }
      }

      return tx.audit.update({
        where: { AU_Id: auditId },
        data: { AU_Status: 'TERMINE' }
      });
    });
  }
}