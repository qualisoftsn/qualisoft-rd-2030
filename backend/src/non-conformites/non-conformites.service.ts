import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NonConformiteService {
  constructor(private prisma: PrismaService) {}

  /** ✅ LISTE DES NC (ALIGNÉE SCHÉMA) */
  async findAll(tenantId: string, processusId?: string) {
    return this.prisma.nonConformite.findMany({
      where: { 
        tenantId: tenantId,
        ...(processusId && { NC_ProcessusId: processusId })
      },
      include: {
        NC_Processus: true,
        NC_Detector: { select: { U_FirstName: true, U_LastName: true } },
        NC_Actions: true
      },
      orderBy: { NC_CreatedAt: 'desc' }
    });
  }

  /** ✅ CRÉATION NC (ALIGNÉE SCHÉMA) */
  async create(data: any, tenantId: string) {
    return this.prisma.nonConformite.create({
      data: {
        NC_Libelle: data.NC_Libelle,
        NC_Description: data.NC_Description,
        NC_Diagnostic: data.NC_Diagnostic || "",
        NC_Gravite: data.NC_Gravite || "MINEURE",
        NC_Statut: data.NC_Statut || "DETECTION",
        NC_Source: data.NC_Source || "INTERNAL_AUDIT",
        tenantId: tenantId,
        NC_ProcessusId: data.NC_ProcessusId,
        NC_DetectorId: data.NC_DetectorId,
        NC_AuditId: data.NC_AuditId || null,
      }
    });
  }

  /** ✅ MISE À JOUR NC */
  async update(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.nonConformite.findFirst({
      where: { NC_Id: id, tenantId: tenantId }
    });
    if (!existing) throw new NotFoundException("Non-Conformité introuvable.");

    return this.prisma.nonConformite.update({
      where: { NC_Id: id },
      data: {
        NC_Libelle: data.NC_Libelle,
        NC_Description: data.NC_Description,
        NC_Diagnostic: data.NC_Diagnostic,
        NC_Gravite: data.NC_Gravite,
        NC_Statut: data.NC_Statut,
      }
    });
  }

  /** ✅ SUPPRESSION */
  async remove(id: string, tenantId: string) {
    return this.prisma.nonConformite.deleteMany({ 
      where: { NC_Id: id, tenantId: tenantId } 
    });
  }

  /** ✅ LIAISON PAQ (CORRECTION ERREUR TS2322) */
  async linkToPAQ(ncId: string, userId: string, tenantId: string) {
    const nc = await this.prisma.nonConformite.findFirst({ 
      where: { NC_Id: ncId, tenantId: tenantId } 
    });
    
    if (!nc) throw new NotFoundException("NC introuvable.");
    
    // Correction Erreur TS2322 : On vérifie que le processus est défini
    if (!nc.NC_ProcessusId) {
      throw new BadRequestException("Cette NC n'est rattachée à aucun processus. Liaison PAQ impossible.");
    }

    const paq = await this.prisma.pAQ.findFirst({
      where: { 
        tenantId: tenantId,
        PAQ_ProcessusId: nc.NC_ProcessusId, // Ici Prisma attend une string (non null)
      },
      orderBy: { PAQ_Year: 'desc' }
    });

    if (!paq) throw new BadRequestException("Aucun Plan d'Actions (PAQ) n'est ouvert pour ce processus.");

    return this.prisma.action.create({
      data: {
        ACT_Title: `[CAPA] ${nc.NC_Libelle}`,
        ACT_Description: nc.NC_Description,
        ACT_Origin: 'NON_CONFORMITE',
        ACT_Status: 'A_FAIRE',
        ACT_PAQId: paq.PAQ_Id,
        ACT_NCId: nc.NC_Id,
        ACT_ResponsableId: userId,
        ACT_CreatorId: userId,
        tenantId: tenantId,
      }
    });
  }
}