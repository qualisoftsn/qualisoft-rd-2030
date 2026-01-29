import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  AuditStatus, NCStatus, NCGravity, FindingType, 
  ActionOrigin, ActionType, ActionStatus 
} from '@prisma/client';

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.audit.findMany({
      where: { tenantId, AU_IsActive: true },
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

  async findOne(id: string, tenantId: string) {
    const audit = await this.prisma.audit.findFirst({
      where: { AU_Id: id, tenantId, AU_IsActive: true },
      include: {
        AU_Processus: { include: { PR_Pilote: true, PR_CoPilote: true } },
        AU_Lead: true, 
        AU_Site: true, 
        AU_Findings: true,
        AU_NonConformites: { 
          include: { NC_Actions: true, NC_Detector: true } 
        }
      }
    });
    if (!audit) throw new NotFoundException("L'audit demandé est introuvable ou archivé.");
    return audit;
  }

  async create(data: any, tenantId: string) {
    return this.prisma.audit.create({
      data: {
        AU_Reference: data.AU_Reference || `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        AU_Title: data.AU_Title,
        AU_Scope: data.AU_Scope || "Périmètre SMI",
        AU_DateAudit: new Date(data.AU_DateAudit),
        AU_Status: AuditStatus.PLANIFIE,
        tenantId,
        AU_SiteId: data.AU_SiteId,
        AU_ProcessusId: data.AU_ProcessusId,
        AU_LeadId: data.AU_LeadId,
      }
    });
  }

  async signAcceptance(auditId: string, userId: string, tenantId: string, hash: string) {
    const audit = await this.prisma.audit.findUnique({ 
      where: { AU_Id: auditId }, 
      include: { AU_Processus: true } 
    });

    if (!audit || audit.tenantId !== tenantId) throw new NotFoundException("Audit introuvable.");
    
    // Vérification stricte du Pilote (§5.3)
    const isPilote = audit.AU_Processus?.PR_PiloteId === userId || audit.AU_Processus?.PR_CoPiloteId === userId;
    if (!isPilote) throw new ForbiddenException("La signature est réservée au Pilote ou Copilote du processus.");

    return await this.prisma.$transaction(async (tx) => {
      await tx.signature.create({
        data: { 
          SIG_EntityType: 'AUDIT', 
          SIG_EntityId: auditId, 
          SIG_UserId: userId, 
          tenantId, 
          SIG_Hash: hash 
        }
      });

      return tx.audit.update({ 
        where: { AU_Id: auditId }, 
        data: { AU_Status: AuditStatus.EN_COURS } 
      });
    });
  }

  async closeAuditWithReport(auditId: string, reportData: any, tenantId: string, auditorId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const audit = await tx.audit.findUnique({ 
        where: { AU_Id: auditId }, 
        include: { AU_Processus: true } 
      });

      if (!audit || audit.tenantId !== tenantId) throw new NotFoundException("Audit introuvable.");

      // 1. Enregistrement des constats (Findings)
      if (reportData.findings?.length > 0) {
        await tx.finding.createMany({
          data: reportData.findings.map((f: any) => ({
            FI_Description: f.FI_Description, 
            FI_Type: f.FI_Type as FindingType, 
            FI_AuditId: auditId
          }))
        });
      }

      // 2. Traitement des Non-Conformités (§10.2)
      for (const nc of (reportData.nonConformites || [])) {
        const createdNc = await tx.nonConformite.create({
          data: {
            NC_Libelle: nc.NC_Libelle, 
            NC_Description: nc.NC_Description,
            NC_Gravite: (nc.NC_Gravite as NCGravity) || NCGravity.MINEURE,
            NC_Statut: NCStatus.DETECTION, 
            NC_Source: 'INTERNAL_AUDIT',
            NC_AuditId: auditId, 
            NC_ProcessusId: audit.AU_ProcessusId,
            NC_DetectorId: auditorId, 
            tenantId
          }
        });

        // 3. Liaison automatique au Plan d'Amélioration (PAQ)
        if (audit.AU_ProcessusId) {
          const paq = await tx.pAQ.findFirst({ 
            where: { 
              PAQ_ProcessusId: audit.AU_ProcessusId as string,
              PAQ_Year: new Date().getFullYear(), 
              tenantId: tenantId 
            } 
          });

          if (paq) {
            await tx.action.create({
              data: {
                ACT_Title: `[AUDIT] Correctif : ${nc.NC_Libelle}`, 
                ACT_Origin: ActionOrigin.AUDIT,
                ACT_Type: ActionType.CORRECTIVE, 
                ACT_Status: ActionStatus.A_FAIRE,
                ACT_PAQId: paq.PAQ_Id, 
                ACT_AuditId: auditId, 
                ACT_NCId: createdNc.NC_Id,
                tenantId, 
                ACT_ResponsableId: audit.AU_LeadId || auditorId, 
                ACT_CreatorId: auditorId
              }
            });
          }
        }
      }

      // 4. Clôture de l'audit
      return tx.audit.update({ 
        where: { AU_Id: auditId }, 
        data: { AU_Status: AuditStatus.TERMINE } 
      });
    });
  }
}