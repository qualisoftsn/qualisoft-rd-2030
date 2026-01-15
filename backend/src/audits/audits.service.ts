import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditsService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: string) {
    return this.prisma.audit.findMany({
      where: { tenantId: tenantId },
      include: { 
        AU_Processus: true, 
        AU_Lead: true, 
        AU_Site: true,
        AU_NonConformites: true,
        AU_Findings: true
      },
      orderBy: { AU_DateAudit: 'asc' }
    });
  }

  async create(data: any, tenantId: string) {
    return this.prisma.audit.create({
      data: {
        AU_Reference: data.AU_Reference || `AUD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        AU_Title: data.AU_Title,
        AU_Scope: data.AU_Scope || "Périmètre de certification",
        AU_DateAudit: new Date(data.AU_DateAudit),
        AU_Status: 'PLANIFIE',
        tenantId: tenantId,
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

    if (!audit || audit.tenantId !== tenantId) {
      throw new NotFoundException("Audit introuvable.");
    }

    const isPilote = audit.AU_Processus?.PR_PiloteId === userId;
    const isCoPilote = audit.AU_Processus?.PR_CoPiloteId === userId;

    if (!isPilote && !isCoPilote) {
      throw new ForbiddenException("Seul le Pilote ou Copilote peut signer l'acceptation.");
    }

    await this.prisma.signature.create({
      data: {
        SIG_EntityType: 'AUDIT',
        SIG_EntityId: auditId,
        SIG_UserId: userId,
        tenantId: tenantId,
        SIG_Hash: hash,
        //SIG_Metadata: { step: 'ACCEPTANCE_PLANNING', role: isPilote ? 'PILOTE' : 'COPILOTE' }
      }
    });

    return this.prisma.audit.update({
      where: { AU_Id: auditId },
      data: { AU_Status: 'EN_COURS' }
    });
  }

  async closeAuditWithReport(auditId: string, reportData: any, tenantId: string, auditorId: string) {
    const { findings, nonConformites } = reportData;

    return await this.prisma.$transaction(async (tx) => {
      const audit = await tx.audit.findUnique({ 
        where: { AU_Id: auditId }
      });
      
      if (!audit || audit.tenantId !== tenantId) throw new NotFoundException("Audit introuvable.");

      if (findings?.length > 0) {
        await tx.finding.createMany({
          data: findings.map((f: any) => ({
            FI_Description: f.FI_Description,
            FI_Type: f.FI_Type,
            FI_AuditId: auditId
          }))
        });
      }

      if (nonConformites?.length > 0) {
        for (const nc of nonConformites) {
          const createdNc = await tx.nonConformite.create({
            data: {
              NC_Libelle: nc.NC_Libelle,
              NC_Description: nc.NC_Description,
              NC_Gravite: nc.NC_Gravite || "MINEURE",
              NC_Statut: "A_TRAITER",
              NC_Source: 'INTERNAL_AUDIT',
              NC_AuditId: auditId,
              NC_DetectorId: auditorId,
              tenantId: tenantId
            }
          });

          // 🛡️ Correction 1 & 2 : Cast 'as string' pour satisfaire le compilateur strict
          if (audit.AU_ProcessusId) {
            const paq = await tx.pAQ.findFirst({ 
              where: { PAQ_ProcessusId: audit.AU_ProcessusId as string } 
            });

            if (paq) {
              await tx.action.create({
                data: {
                  ACT_Title: `Suite audit : ${nc.NC_Libelle}`,
                  ACT_Origin: 'AUDIT',
                  ACT_Type: 'CORRECTIVE',
                  ACT_Status: 'A_FAIRE',
                  ACT_PAQId: paq.PAQ_Id, // ✅ Corrigé : PAQ_Id au lieu de PA_Id
                  ACT_AuditId: auditId,
                  tenantId: tenantId,
                  // 🛡️ Correction 3 : Cast 'as string'
                  ACT_ResponsableId: (audit.AU_LeadId || auditorId) as string,
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